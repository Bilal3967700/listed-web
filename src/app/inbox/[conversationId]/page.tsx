import Image from "next/image";
import Link from "next/link";
import {
  notFound,
  redirect
} from "next/navigation";
import {
  ArrowLeft
} from "lucide-react";

import { MessageThread } from "@/components/messaging/MessageThread";
import { getConversation } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

function getInitial(name: string) {
  return (
    name.trim().charAt(0).toUpperCase() ||
    "L"
  );
}

export default async function ConversationPage({
  params
}: {
  params: Promise<{
    conversationId: string;
  }>;
}) {
  const { conversationId } =
    await params;

  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Please log in to view this conversation."
      )}`
    );
  }

  const { error: markReadError } =
    await supabase.rpc(
      "mark_conversation_read",
      {
        p_conversation_id:
          conversationId
      }
    );

  if (markReadError) {
    console.error(
      "markConversationRead error:",
      markReadError.message
    );
  }

  const result =
    await getConversation(
      conversationId,
      user.id
    );

  if (!result) {
    notFound();
  }

  const {
    conversation,
    messages
  } = result;

  return (
    <div className="mx-auto max-w-3xl pb-4">
      <header className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <Link
          href="/inbox"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-soft)]"
          aria-label="Back to inbox"
        >
          <ArrowLeft
            size={20}
            aria-hidden="true"
          />
        </Link>

        <Link
          href={`/u/${conversation.otherUsername}`}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-lg font-black">
            {conversation.otherAvatarUrl ? (
              <Image
                src={
                  conversation.otherAvatarUrl
                }
                alt={
                  conversation.otherUserName
                }
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              getInitial(
                conversation.otherUserName
              )
            )}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-black group-hover:underline">
              {conversation.otherUserName}
            </h1>

            <p className="truncate text-sm font-bold text-[var(--text-muted)]">
              @{conversation.otherUsername}
            </p>
          </div>
        </Link>
      </header>

      <MessageThread
        conversation={conversation}
        initialMessages={messages}
        currentUserId={user.id}
      />
    </div>
  );
}