"use client";

import Image from "next/image";
import Link from "next/link";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";

import {
  Send
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatLkr } from "@/lib/utils";

import {
  ConversationDetails,
  ConversationMessage
} from "@/types/messaging";

type RealtimeMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function MessageThread({
  conversation,
  initialMessages,
  currentUserId
}: {
  conversation: ConversationDetails;
  initialMessages: ConversationMessage[];
  currentUserId: string;
}) {
  const supabase = createClient();

  const [
    messages,
    setMessages
  ] = useState(initialMessages);

  const [body, setBody] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const endRef =
    useRef<HTMLDivElement>(null);

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
              if (
                currentMessages.some(
                  (message) =>
                    message.id ===
                    newMessage.id
                )
              ) {
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
            void supabase
              .from("messages")
              .update({
                read_at:
                  new Date().toISOString()
              })
              .eq("id", row.id);
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
    supabase
  ]);

  useEffect(() => {
    void supabase
      .from("messages")
      .update({
        read_at:
          new Date().toISOString()
      })
      .eq(
        "conversation_id",
        conversation.id
      )
      .neq(
        "sender_id",
        currentUserId
      )
      .is("read_at", null);
  }, [
    conversation.id,
    currentUserId,
    supabase
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages]);

  async function sendMessage(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanBody =
      body.trim();

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
        if (
          currentMessages.some(
            (message) =>
              message.id ===
              sentMessage.id
          )
        ) {
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
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <Link
        href={
          conversation.listingId
            ? `/listing/${conversation.listingId}`
            : "#"
        }
        className={[
          "flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3",
          conversation.listingId
            ? ""
            : "pointer-events-none"
        ].join(" ")}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-soft)]">
          {conversation.listingImageUrl ? (
            <Image
              src={
                conversation.listingImageUrl
              }
              alt={
                conversation.listingTitle
              }
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="truncate font-black">
            {
              conversation.listingTitle
            }
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
            {formatLkr(
              conversation.listingPriceLkr
            )}
          </p>

          {!conversation.listingId && (
            <p className="mt-1 text-xs text-[var(--danger)]">
              This listing is no longer
              available.
            </p>
          )}
        </div>
      </Link>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="flex min-h-60 items-center justify-center text-center">
            <div>
              <p className="text-lg font-black">
                Start the conversation
              </p>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                Ask whether the item is
                available, request more
                information or discuss
                delivery and pickup.
              </p>
            </div>
          </div>
        )}

        {messages.map(
          (message) => {
            const isOwnMessage =
              message.senderId ===
              currentUserId;

            return (
              <div
                key={message.id}
                className={[
                  "flex",
                  isOwnMessage
                    ? "justify-end"
                    : "justify-start"
                ].join(" ")}
              >
                <div
                  className={[
                    "max-w-[82%] rounded-3xl px-4 py-3 sm:max-w-[70%]",
                    isOwnMessage
                      ? "rounded-br-md bg-[var(--text)] text-[var(--background)]"
                      : "rounded-bl-md bg-[var(--surface-soft)] text-[var(--text)]"
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
                    {new Intl.DateTimeFormat(
                      "en",
                      {
                        hour: "numeric",
                        minute:
                          "2-digit"
                      }
                    ).format(
                      new Date(
                        message.createdAt
                      )
                    )}
                  </p>
                </div>
              </div>
            );
          }
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-24 mt-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg md:bottom-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={body}
            onChange={(event) =>
              setBody(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            rows={1}
            maxLength={2000}
            placeholder={`Message ${conversation.otherUserName}`}
            className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl bg-[var(--background)] px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={
              isSending ||
              !body.trim()
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[var(--surface)] disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
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