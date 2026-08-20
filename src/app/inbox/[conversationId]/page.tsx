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

  const result =
    await getConversation(
      conversationId,
      user.id
    );

  if (!result) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/inbox"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
          aria-label="Back to inbox"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-xl font-black">
            {
              result.conversation.otherUserName
            }
          </h1>

          <Link
            href={`/u/${result.conversation.otherUsername}`}
            className="text-sm font-bold text-[var(--text-muted)]"
          >
            @
            {
              result.conversation.otherUsername
            }
          </Link>
        </div>
      </header>

      <MessageThread
        conversation={
          result.conversation
        }
        initialMessages={
          result.messages
        }
        currentUserId={user.id}
      />
    </div>
  );
}