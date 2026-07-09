import Link from "next/link";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import { fakeListings } from "@/data/fakeListings";
import { formatLkr } from "@/lib/utils";

export default async function ListingDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = fakeListings.find((item) => item.id === id);

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-bold">Listing not found</p>
      </div>
    );
  }

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
        <div className="overflow-hidden rounded-[2rem] bg-[var(--surface-soft)]">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="aspect-[0.85] w-full object-cover"
          />
        </div>

        <div>
          <p className="text-lg font-bold">{listing.brand}</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {listing.title}
          </h1>

          <p className="mt-4 text-3xl font-black">
            {formatLkr(listing.priceLkr)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
            <span>{listing.condition}</span>
            {listing.size && <span>• {listing.size}</span>}
          </div>

          <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Seller
            </p>
            <p className="mt-2 text-xl font-black">@{listing.sellerName}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {listing.isVerifiedSeller ? "Verified Seller" : "Community Seller"}
            </p>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Description
            </p>
            <p className="mt-3 leading-7 text-[var(--text)]">
              {listing.description}
            </p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
            <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] font-bold">
              <MessageCircle size={18} />
              Message
            </button>
            <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-bold text-[var(--surface)]">
              <ShoppingBag size={18} />
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}