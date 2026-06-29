"use client";

import Link from "next/link";
import { BadgeCheck, Heart } from "lucide-react";
import { Listing } from "@/types/listing";
import { formatLkr, formatTimeAgo } from "@/lib/utils";
import { useFeedStore } from "@/store/useFeedStore";

export function ListingCard({ listing }: { listing: Listing }) {
  const toggleLike = useFeedStore((state) => state.toggleLike);

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-soft)]">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="aspect-[0.82] w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <button
          onClick={(event) => {
            event.preventDefault();
            toggleLike(listing.id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/90"
        >
          <Heart
            size={17}
            className={listing.liked ? "fill-red-500 text-red-500" : ""}
          />
        </button>

        <div className="absolute bottom-3 left-3 flex flex-col gap-2">
          <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
            {listing.category}
          </span>

          {listing.isVerifiedSeller && (
            <span className="flex w-fit items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
              <BadgeCheck size={12} />
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pt-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="truncate text-base font-bold">{listing.brand}</h3>
          <span className="shrink-0 text-xs text-[var(--text-muted)]">
            {formatTimeAgo(listing.createdAt)}
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-[var(--text)]">
          {listing.title}
        </p>

        <div className="mt-2 flex flex-wrap gap-1 text-xs text-[var(--text-muted)]">
          <span>{listing.condition}</span>
          {listing.size && <span>• {listing.size}</span>}
        </div>

        <p className="mt-2 text-base font-black">{formatLkr(listing.priceLkr)}</p>

        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
          @{listing.sellerName} · {listing.suburb}
        </p>
      </div>
    </Link>
  );
}