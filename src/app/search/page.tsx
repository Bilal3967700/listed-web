import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

const categories = [
  "Fashion",
  "Bags",
  "T-shirts",
  "Laptops",
  "Phones",
  "Watches",
  "Jewellery",
  "Tech",
  "Sneakers"
];

export default function SearchPage() {
  return (
    <div>
      <h1 className="text-4xl font-black">Search</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Discover quality second-hand finds.
      </p>

      <div className="mt-6 flex gap-3">
        <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4">
          <Search size={18} />
          <span className="text-sm text-[var(--text-muted)]">
            Search brands, items or categories
          </span>
        </div>

        <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-black">Browse categories</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h2 className="text-xl font-black">Curated for you</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Collection cards and search results will come next.
        </p>
      </section>
    </div>
  );
}