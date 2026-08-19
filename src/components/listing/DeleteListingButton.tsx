"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteListingButton({
  listingId,
  sellerUsername
}: {
  listingId: string;
  sellerUsername: string;
}) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function deleteListing() {
    const confirmed = window.confirm(
      "Delete this listing permanently? This cannot be undone."
    );

    if (!confirmed || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } =
      await supabase.rpc(
        "delete_owned_listing",
        {
          p_listing_id: listingId
        }
      );

    if (error) {
      setMessage(error.message);
      setIsDeleting(false);
      return;
    }

    const storagePaths = (
      (data || []) as {
        storage_path: string | null;
      }[]
    )
      .map((item) => item.storage_path)
      .filter(
        (path): path is string =>
          Boolean(path)
      );

    if (storagePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from("listing-images")
          .remove(storagePaths);

      if (storageError) {
        console.error(
          "Storage cleanup error:",
          storageError.message
        );
      }
    }

    router.push(
      `/u/${sellerUsername}`
    );

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() =>
          void deleteListing()
        }
        className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--danger)] px-5 font-bold text-[var(--danger)] disabled:opacity-60"
      >
        <Trash2 size={17} />

        {isDeleting
          ? "Deleting..."
          : "Delete listing"}
      </button>

      {message && (
        <p className="mt-2 text-sm font-bold text-[var(--danger)]">
          {message}
        </p>
      )}
    </div>
  );
}