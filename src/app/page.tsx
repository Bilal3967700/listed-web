"use client";

import { useMemo, useState } from "react";
import { Bell, Bookmark } from "lucide-react";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingCategory } from "@/types/listing";
import { useFeedStore } from "@/store/useFeedStore";

const filters: ListingCategory[] = [
  "New In",
  "Trending",
  "Bags",
  "Shoes",
  "Watches",
  "Jewellery",
  "Tech"
];

export default function HomePage() {
  const listings = useFeedStore((state) => state.listings);
  const [activeFilter, setActiveFilter] = useState<ListingCategory>("New In");

  const filteredListings = useMemo(() => {
    if (activeFilter === "New In") {
      return [...listings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (activeFilter === "Trending") {
      return listings.filter(
        (item) => item.liked || item.isVerifiedSeller
      );
    }

    return listings.filter((item) => item.category === activeFilter);
  }, [activeFilter, listings]);

  return (
    <div>
      <section className="mb-8 rounded-[2rem] bg-[var(--surface)] p-5 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Listed.lk
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Buy and sell quality finds in Sri Lanka.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] md:text-base">
              A cleaner, more trusted resale marketplace for fashion, tech,
              bags, watches, jewellery and everyday items.
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]">
              <Bell size={18} />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]">
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold",
                  active
                    ? "border-[var(--text)] bg-[var(--text)] text-[var(--surface)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
                ].join(" ")}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </section>
    </div>
  );
}