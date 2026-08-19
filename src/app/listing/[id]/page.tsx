import Link from "next/link";

import {
  ArrowLeft,
  MessageCircle,
  Pencil,
  ShoppingBag
} from "lucide-react";

import { DeleteListingButton } from "@/components/listing/DeleteListingButton";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { getListingById } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { formatLkr } from "@/lib/utils";

export default async function ListingDetailsPage({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const [listing, supabase] =
    await Promise.all([
      getListingById(id),
      createClient()
    ]);

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-bold">
          Listing not found
        </p>
      </div>
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isOwner =
    user?.id === listing.sellerId;

  const images =
    listing.imageUrls.length > 0
      ? listing.imageUrls
      : [listing.imageUrl];

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ListingGallery
          images={images}
          title={listing.title}
        />

        <div>
          {listing.brand && (
            <p className="text-lg font-bold">
              {listing.brand}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {listing.title}
          </h1>

          <p className="mt-4 text-3xl font-black">
            {formatLkr(
              listing.priceLkr
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
            <span>
              {listing.condition}
            </span>

            {listing.size && (
              <span>
                • {listing.size}
              </span>
            )}

            <span>
              • {listing.category}
            </span>
          </div>

          {isOwner && (
            <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Your listing
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/listing/${listing.id}/edit`}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--text)] px-5 font-bold text-[var(--surface)]"
                >
                  <Pencil size={17} />
                  Edit listing
                </Link>

                <DeleteListingButton
                  listingId={
                    listing.id
                  }
                  sellerUsername={
                    listing.sellerUsername
                  }
                />
              </div>
            </section>
          )}

          <Link
            href={`/u/${listing.sellerUsername}`}
            className="mt-8 block rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Seller
            </p>

            <p className="mt-2 text-xl font-black">
              @{listing.sellerUsername}
            </p>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {listing.isVerifiedSeller
                ? "Verified Seller"
                : "Community Seller"}
            </p>
          </Link>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Description
            </p>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--text)]">
              {listing.description}
            </p>
          </div>

          {!isOwner && (
            <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
              <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] font-bold">
                <MessageCircle
                  size={18}
                />
                Message
              </button>

              <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-bold text-[var(--surface)]">
                <ShoppingBag
                  size={18}
                />
                Buy now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}