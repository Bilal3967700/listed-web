"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  ChevronRight,
  ImageIcon,
  Send
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatLkr } from "@/lib/utils";
import {
  type ConversationDetails,
  type ConversationMessage
} from "@/types/messaging";

type RealtimeMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function formatMessageTime(
  dateString: string
) {
  return new Intl.DateTimeFormat(
    "en-LK",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(new Date(dateString));
}

function getInitial(name: string) {
  return (
    name.trim().charAt(0).toUpperCase() ||
    "L"
  );
}

export function MessageThread({
  conversation,
  initialMessages,
  currentUserId
}: {
  conversation: ConversationDetails;
  initialMessages: ConversationMessage[];
  currentUserId: string;
}) {
  const [supabase] = useState(() =>
    createClient()
  );

  const [messages, setMessages] =
    useState(initialMessages);

  const [body, setBody] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const endRef =
    useRef<HTMLDivElement>(null);

  const markConversationRead =
    useCallback(async () => {
      const { error } =
        await supabase.rpc(
          "mark_conversation_read",
          {
            p_conversation_id:
              conversation.id
          }
        );

      if (error) {
        console.error(
          "Mark conversation read error:",
          error.message
        );

        return;
      }

      window.dispatchEvent(
        new Event(
          "listed:unread-changed"
        )
      );
    }, [
      supabase,
      conversation.id
    ]);

  useEffect(() => {
    const channel = supabase
      .channel(
        `conversation:${conversation.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter:
            `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const row =
            payload.new as RealtimeMessageRow;

          const newMessage:
            ConversationMessage = {
            id: row.id,
            conversationId:
              row.conversation_id,
            senderId:
              row.sender_id,
            body: row.body,
            readAt: row.read_at,
            createdAt:
              row.created_at
          };

          setMessages(
            (currentMessages) => {
              const alreadyExists =
                currentMessages.some(
                  (message) =>
                    message.id ===
                    newMessage.id
                );

              if (alreadyExists) {
                return currentMessages;
              }

              return [
                ...currentMessages,
                newMessage
              ];
            }
          );

          if (
            row.sender_id !==
            currentUserId
          ) {
            void markConversationRead();
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [
    conversation.id,
    currentUserId,
    markConversationRead,
    supabase
  ]);

  useEffect(() => {
    void markConversationRead();
  }, [markConversationRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, [messages]);

  async function sendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanBody = body.trim();

    if (
      !cleanBody ||
      isSending
    ) {
      return;
    }

    if (
      cleanBody.length > 2000
    ) {
      setErrorMessage(
        "Messages can contain up to 2,000 characters."
      );

      return;
    }

    setIsSending(true);
    setErrorMessage("");

    const {
      data,
      error
    } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          conversation.id,
        sender_id:
          currentUserId,
        body: cleanBody
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        body,
        read_at,
        created_at
      `)
      .single();

    if (error || !data) {
      setErrorMessage(
        error?.message ||
          "The message could not be sent."
      );

      setIsSending(false);
      return;
    }

    const sentMessage:
      ConversationMessage = {
      id: data.id,
      conversationId:
        data.conversation_id,
      senderId:
        data.sender_id,
      body: data.body,
      readAt: data.read_at,
      createdAt:
        data.created_at
    };

    setMessages(
      (currentMessages) => {
        const alreadyExists =
          currentMessages.some(
            (message) =>
              message.id ===
              sentMessage.id
          );

        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          sentMessage
        ];
      }
    );

    setBody("");
    setIsSending(false);

    window.dispatchEvent(
      new Event(
        "listed:unread-changed"
      )
    );
  }

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      event.currentTarget.form
        ?.requestSubmit();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col">
      {conversation.listingId ? (
        <Link
          href={`/listing/${conversation.listingId}`}
          className="group flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition hover:border-[var(--text-muted)]"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-soft)]">
            {conversation.listingImageUrl ? (
              <Image
                src={
                  conversation.listingImageUrl
                }
                alt={
                  conversation.listingTitle
                }
                fill
                sizes="80px"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                <ImageIcon
                  size={22}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Listing
            </p>

            <p className="mt-1 truncate font-black">
              {conversation.listingTitle}
            </p>

            <p className="mt-1 text-sm font-bold">
              {formatLkr(
                conversation.listingPriceLkr
              )}
            </p>
          </div>

          <ChevronRight
            size={20}
            className="shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
            <ImageIcon
              size={22}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate font-black">
              {conversation.listingTitle}
            </p>

            <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
              {formatLkr(
                conversation.listingPriceLkr
              )}
            </p>

            <p className="mt-1 text-xs font-bold text-[var(--danger)]">
              This listing is no longer
              available.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex-1 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center text-center">
            <div className="rounded-3xl bg-[var(--surface)] px-6 py-8">
              <p className="text-lg font-black">
                Start the conversation
              </p>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                Ask whether the item is
                available, request more
                information, or discuss
                delivery and pickup.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(
              (message) => {
                const isOwnMessage =
                  message.senderId ===
                  currentUserId;

                return (
                  <div
                    key={message.id}
                    className={[
                      "flex items-end gap-2",
                      isOwnMessage
                        ? "justify-end"
                        : "justify-start"
                    ].join(" ")}
                  >
                    {!isOwnMessage && (
                      <Link
                        href={`/u/${conversation.otherUsername}`}
                        className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--surface-soft)]"
                        aria-label={`View ${conversation.otherUserName}'s profile`}
                      >
                        {conversation.otherAvatarUrl ? (
                          <Image
                            src={
                              conversation.otherAvatarUrl
                            }
                            alt={
                              conversation.otherUserName
                            }
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-black">
                            {getInitial(
                              conversation.otherUserName
                            )}
                          </span>
                        )}
                      </Link>
                    )}

                    <div
                      className={[
                        "w-fit min-w-0 max-w-[78%] rounded-3xl px-4 py-3 sm:max-w-[65%]",
                        isOwnMessage
                          ? "rounded-br-md bg-[#263943] text-white dark:bg-[#f6f2eb] dark:text-[#101820]"
                          : "rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                      ].join(" ")}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.body}
                      </p>

                      <p
                        className={[
                          "mt-1 text-right text-[10px]",
                          isOwnMessage
                            ? "opacity-65"
                            : "text-[var(--text-muted)]"
                        ].join(" ")}
                      >
                        {formatMessageTime(
                          message.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}

            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-24 z-30 mt-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-lg backdrop-blur md:bottom-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={body}
            onChange={(event) =>
              setBody(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            placeholder={`Message ${conversation.otherUserName}`}
            className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl bg-[var(--background)] px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
          />

          <button
            type="submit"
            disabled={
              isSending ||
              !body.trim()
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#263943] text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#f6f2eb] dark:text-[#101820]"
            aria-label="Send message"
          >
            <Send
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        {errorMessage && (
          <p className="mt-2 px-2 text-xs font-bold text-[var(--danger)]">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}