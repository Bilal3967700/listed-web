import Link from "next/link";
import { Heart } from "lucide-react";
import { Listing } from "@/types/listing";
import { formatLkr } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-soft)]">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="aspect-[0.82] w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/90"
          aria-label="Save listing"
        >
          <Heart size={17} />
        </button>
      </div>

      <div className="px-1 pt-2">
        <p className="truncate text-sm font-medium text-[var(--text)]">
          {listing.title}
        </p>

        <p className="mt-1 text-sm font-bold text-[var(--text)]">
          {formatLkr(listing.priceLkr)}
        </p>
      </div>
    </Link>
  );
}