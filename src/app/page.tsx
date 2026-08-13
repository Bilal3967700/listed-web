import Link from "next/link";
import { ListingCard } from "@/components/listing/ListingCard";
import { getActiveListings } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "new-in";

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug, parent_id, sort_order")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const listings = await getActiveListings(activeCategory);

  const filters = [
    { name: "New In", slug: "new-in" },
    ...(categories || [])
  ];

  return (
    <div>
      <section className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const active = activeCategory === filter.slug;

            return (
              <Link
                key={filter.slug}
                href={filter.slug === "new-in" ? "/" : `/?category=${filter.slug}`}
                className={[
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold",
                  active
                    ? "border-[var(--text)] bg-[var(--text)] text-[var(--surface)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                ].join(" ")}
              >
                {filter.name}
              </Link>
            );
          })}
        </div>
      </section>

      {listings.length > 0 ? (
        <section className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-xl font-black">No listings yet</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Once users start listing items, they’ll appear here.
          </p>
        </section>
      )}
    </div>
  );
}