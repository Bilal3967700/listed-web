"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingCategory } from "@/types/listing";
import { useFeedStore } from "@/store/useFeedStore";

const filters: ListingCategory[] = [
  "New In",
  "Trending",
  "Vintage",
  "Clothing",
  "Shoes",
  "Bags",
  "Watches",
  "Collectibles",
  "Tech",
  "Cameras"
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
      return listings.filter((item) => item.liked || item.isVerifiedSeller);
    }

    return listings.filter((item) => item.category === activeFilter);
  }, [activeFilter, listings]);

  return (
    <div>
      <section className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
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
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
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