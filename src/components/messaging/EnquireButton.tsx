"use client";

import {
  MessageCircle
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnquireButton({
  listingId,
  isLoggedIn
}: {
  listingId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  const [isOpening, setIsOpening] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function openConversation() {
    if (!isLoggedIn) {
      const nextPath =
        `/listing/${listingId}`;

      router.push(
        `/login?message=${encodeURIComponent(
          "Please log in or create an account to enquire about this listing."
        )}&next=${encodeURIComponent(
          nextPath
        )}`
      );

      return;
    }

    if (isOpening) {
      return;
    }

    setIsOpening(true);
    setMessage("");

    const response = await fetch(
      "/api/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          listingId
        })
      }
    );

    const payload =
      await response.json();

    if (response.status === 401) {
      router.push(
        `/login?message=${encodeURIComponent(
          "Please log in to enquire about this listing."
        )}`
      );

      return;
    }

    if (
      !response.ok ||
      !payload.conversationId
    ) {
      setMessage(
        payload.error ||
          "The conversation could not be opened."
      );

      setIsOpening(false);
      return;
    }

    router.push(
      `/inbox/${payload.conversationId}`
    );
  }

  return (
    <div className="flex-1">
      <button
        type="button"
        disabled={isOpening}
        onClick={() =>
          void openConversation()
        }
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] font-black disabled:opacity-60"
      >
        <MessageCircle
          size={18}
          aria-hidden="true"
        />

        {isOpening
          ? "Opening..."
          : "Enquire"}
      </button>

      {message && (
        <p className="mt-2 text-center text-xs font-bold text-[var(--danger)]">
          {message}
        </p>
      )}
    </div>
  );
}