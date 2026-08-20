import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Inbox,
  MessageCircle
} from "lucide-react";

import { getInboxConversations } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";
import {
  formatLkr,
  formatTimeAgo
} from "@/lib/utils";

export default async function InboxPage() {
  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Please log in to view your inbox."
      )}`
    );
  }

  const conversations =
    await getInboxConversations();

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-4xl font-black">
          Inbox
        </h1>

        <p className="mt-2 text-[var(--text-muted)]">
          Messages from buyers and
          sellers.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="mt-6 space-y-3">
          {conversations.map(
            (conversation) => {
              const sentByCurrentUser =
                conversation.lastMessageSenderId ===
                user.id;

              return (
                <Link
                  key={
                    conversation.id
                  }
                  href={`/inbox/${conversation.id}`}
                  className="flex items-center gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--text-muted)]"
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
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <MessageCircle
                          size={22}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-black">
                        {
                          conversation.otherUserName
                        }
                      </p>

                      <p className="shrink-0 text-xs text-[var(--text-muted)]">
                        {formatTimeAgo(
                          conversation.lastMessageAt
                        )}
                      </p>
                    </div>

                    <p className="mt-1 truncate text-sm font-bold">
                      {
                        conversation.listingTitle
                      }
                      {" · "}
                      {formatLkr(
                        conversation.listingPriceLkr
                      )}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <p
                        className={[
                          "min-w-0 flex-1 truncate text-sm",
                          conversation.unreadCount >
                          0
                            ? "font-black text-[var(--text)]"
                            : "text-[var(--text-muted)]"
                        ].join(" ")}
                      >
                        {sentByCurrentUser
                          ? "You: "
                          : ""}

                        {conversation.lastMessageBody ||
                          "Start the conversation"}
                      </p>

                      {conversation.unreadCount >
                        0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--text)] px-2 text-xs font-black text-[var(--surface)]">
                          {
                            conversation.unreadCount
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-soft)]">
            <Inbox size={28} />
          </div>

          <h2 className="mt-4 text-2xl font-black">
            Your inbox is empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
            When you enquire about an
            item, or a buyer contacts you
            about one of your listings,
            the conversation will appear
            here.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--text)] px-6 font-black text-[var(--surface)]"
          >
            Discover listings
          </Link>
        </div>
      )}
    </div>
  );
}