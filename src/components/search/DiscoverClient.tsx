"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useRouter } from "next/navigation";

import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";

import { ListingCard } from "@/components/listing/ListingCard";
import { Category, Listing } from "@/types/listing";

import {
  RecentSearch,
  SearchFilters,
  SearchSuggestion
} from "@/types/search";

const conditions = [
  "New with tags",
  "New without tags",
  "Excellent",
  "Very Good",
  "Good",
  "Fair"
];

const featuredCollections = [
  {
    title: "Fresh streetwear",
    description: "Everyday pieces with personality",
    href: "/search?q=streetwear",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Tech worth keeping",
    description: "Phones, audio and useful accessories",
    href: "/search?q=tech",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Collectors’ corner",
    description: "Cards, watches and unique finds",
    href: "/search?q=collectibles",
    image:
      "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=1600&auto=format&fit=crop"
  }
];

const popularSearches = [
  {
    query: "Vintage",
    detail: "Timeless pieces",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop"
  },
  {
    query: "Sneakers",
    detail: "Everyday favourites",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop"
  },
  {
    query: "Headphones",
    detail: "Audio discoveries",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=900&auto=format&fit=crop"
  }
];

const featuredBrands = [
  "Nike",
  "Adidas",
  "Apple",
  "Samsung",
  "Levi's",
  "Uniqlo",
  "The North Face",
  "Sony",
  "Pokémon",
  "Converse"
];

export function DiscoverClient({
  listings,
  total,
  categories,
  filters,
  accountSearches,
  userId,
  didYouMean,
  searchEventId
}: {
  listings: Listing[];
  total: number;
  categories: Category[];
  filters: SearchFilters;
  accountSearches: RecentSearch[];
  userId: string | null;
  didYouMean: string | null;
  searchEventId: string | null;
}) {
  const router = useRouter();

  const [query, setQuery] =
    useState(filters.query);

  const [suggestions, setSuggestions] =
    useState<SearchSuggestion[]>([]);

  const [
    showSuggestions,
    setShowSuggestions
  ] = useState(false);

  const [showFilters, setShowFilters] =
    useState(
      Boolean(
        filters.category ||
          filters.minimumPrice ||
          filters.maximumPrice ||
          filters.condition
      )
    );

  const [localSearches, setLocalSearches] =
    useState<RecentSearch[]>([]);

  const [showAllRecent, setShowAllRecent] =
    useState(false);

  const suggestionRequest = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "listed-recent-searches"
        ) || "[]"
      );

      if (Array.isArray(saved)) {
        setLocalSearches(saved.slice(0, 20));
      }
    } catch {
      setLocalSearches([]);
    }
  }, []);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (
      cleanQuery.length < 2 ||
      cleanQuery === filters.query
    ) {
      setSuggestions([]);
      return;
    }

    const requestId =
      ++suggestionRequest.current;

    const timer = window.setTimeout(
      async () => {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(
            cleanQuery
          )}`
        );

        if (
          !response.ok ||
          requestId !==
            suggestionRequest.current
        ) {
          return;
        }

        const payload =
          (await response.json()) as {
            suggestions: SearchSuggestion[];
          };

        setSuggestions(
          payload.suggestions
        );

        setShowSuggestions(true);
      },
      220
    );

    return () =>
      window.clearTimeout(timer);
  }, [query, filters.query]);

  useEffect(() => {
    if (
      !userId ||
      !searchEventId ||
      !filters.query
    ) {
      return;
    }

    const storageKey =
      `listed-recorded-search:${searchEventId}`;

    if (
      sessionStorage.getItem(storageKey)
    ) {
      return;
    }

    sessionStorage.setItem(
      storageKey,
      "true"
    );

    void fetch("/api/search/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: filters.query,
        resultCount: total,
        filters: {
          category:
            filters.category || null,
          minimumPrice:
            filters.minimumPrice ?? null,
          maximumPrice:
            filters.maximumPrice ?? null,
          condition:
            filters.condition || null,
          sort: filters.sort
        }
      }),
      keepalive: true
    });
  }, [
    userId,
    searchEventId,
    filters,
    total
  ]);

  const recentSearches = useMemo(() => {
    const searches =
      new Map<string, RecentSearch>();

    [...accountSearches, ...localSearches]
      .sort((a, b) =>
        b.createdAt.localeCompare(
          a.createdAt
        )
      )
      .forEach((item) => {
        const key =
          item.query.trim().toLowerCase();

        if (
          key &&
          !searches.has(key)
        ) {
          searches.set(key, item);
        }
      });

    return [...searches.values()].slice(
      0,
      20
    );
  }, [accountSearches, localSearches]);

  const hasSearch = Boolean(
    filters.query ||
      filters.category ||
      filters.minimumPrice !== undefined ||
      filters.maximumPrice !== undefined ||
      filters.condition
  );

  const pageCount = Math.max(
    1,
    Math.ceil(total / 24)
  );

  function rememberLocally(
    searchQuery: string
  ) {
    const cleanQuery = searchQuery
      .trim()
      .slice(0, 200);

    if (!cleanQuery) {
      return;
    }

    const next: RecentSearch[] = [
      {
        query: cleanQuery,
        createdAt:
          new Date().toISOString()
      },
      ...localSearches.filter(
        (item) =>
          item.query.toLowerCase() !==
          cleanQuery.toLowerCase()
      )
    ].slice(0, 20);

    setLocalSearches(next);

    localStorage.setItem(
      "listed-recent-searches",
      JSON.stringify(next)
    );
  }

  function newSearchEventId() {
    if (
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
  }

  function submitSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery = query.trim();
    const formData = new FormData(
      event.currentTarget
    );

    const params =
      new URLSearchParams();

    formData.forEach((value, key) => {
      const cleanValue =
        String(value).trim();

      if (cleanValue) {
        params.set(key, cleanValue);
      }
    });

    if (cleanQuery) {
      rememberLocally(cleanQuery);
      params.set(
        "sid",
        newSearchEventId()
      );
    }

    setShowSuggestions(false);

    router.push(
      `/search?${params.toString()}`
    );
  }

  function runSearch(
    searchQuery: string,
    categorySlug?: string | null
  ) {
    const cleanQuery =
      searchQuery.trim();

    if (cleanQuery) {
      rememberLocally(cleanQuery);
    }

    const params =
      new URLSearchParams();

    if (cleanQuery) {
      params.set("q", cleanQuery);
    }

    if (categorySlug) {
      params.set(
        "category",
        categorySlug
      );
    }

    params.set(
      "sid",
      newSearchEventId()
    );

    setShowSuggestions(false);

    router.push(
      `/search?${params.toString()}`
    );
  }

  async function clearHistory() {
    setLocalSearches([]);

    localStorage.removeItem(
      "listed-recent-searches"
    );

    if (userId) {
      await fetch(
        "/api/search/history",
        {
          method: "DELETE"
        }
      );
    }

    router.refresh();
  }

  function categoryLabel(
    category: Category
  ) {
    const labels = [category.name];
    let parentId =
      category.parent_id;

    while (parentId) {
      const parent = categories.find(
        (item) => item.id === parentId
      );

      if (!parent) {
        break;
      }

      labels.unshift(parent.name);
      parentId = parent.parent_id;
    }

    return labels.join(" › ");
  }

  return (
    <div>
      <form
        action="/search"
        method="get"
        onSubmit={submitSearch}
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="flex h-14 items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 shadow-sm focus-within:ring-2 focus-within:ring-[var(--text)]/20">
              <Search size={21} />

              <input
                name="q"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                onFocus={() =>
                  suggestions.length > 0 &&
                  setShowSuggestions(true)
                }
                autoComplete="off"
                maxLength={100}
                placeholder="Search for anything"
                className="h-full w-full bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() =>
                    setQuery("")
                  }
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Visual search coming later"
                  className="text-[var(--text-muted)]"
                  aria-label="Visual search coming later"
                >
                  <Camera size={21} />
                </button>
              )}
            </div>

            {showSuggestions &&
              suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-16 z-50 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
                  {suggestions.map(
                    (item) => (
                      <button
                        type="button"
                        key={`${item.suggestion_type}-${item.suggestion}-${item.category_slug || ""}`}
                        onClick={() =>
                          runSearch(
                            item.suggestion,
                            item.category_slug
                          )
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[var(--surface-soft)]"
                      >
                        <span className="flex items-center gap-3 font-bold">
                          <Search
                            size={16}
                          />
                          {
                            item.suggestion
                          }
                        </span>

                        <span className="text-xs capitalize text-[var(--text-muted)]">
                          {
                            item.suggestion_type
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Search filters"
          >
            <SlidersHorizontal
              size={20}
            />
          </button>

          <button className="hidden h-14 rounded-full bg-[var(--text)] px-7 font-black text-[var(--surface)] sm:block">
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-5">
            <select
              name="category"
              defaultValue={
                filters.category || ""
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 font-bold"
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.slug}
                  >
                    {categoryLabel(
                      category
                    )}
                  </option>
                )
              )}
            </select>

            <input
              name="min"
              type="number"
              min="0"
              defaultValue={
                filters.minimumPrice
              }
              placeholder="Minimum LKR"
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3"
            />

            <input
              name="max"
              type="number"
              min="0"
              defaultValue={
                filters.maximumPrice
              }
              placeholder="Maximum LKR"
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3"
            />

            <select
              name="condition"
              defaultValue={
                filters.condition || ""
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 font-bold"
            >
              <option value="">
                Any condition
              </option>

              {conditions.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {condition}
                  </option>
                )
              )}
            </select>

            <select
              name="sort"
              defaultValue={
                filters.sort
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 font-bold"
            >
              <option value="relevance">
                Most relevant
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="price_asc">
                Price: low to high
              </option>

              <option value="price_desc">
                Price: high to low
              </option>
            </select>

            <button className="h-12 rounded-2xl bg-[var(--text)] font-black text-[var(--surface)] lg:col-start-5">
              Apply filters
            </button>
          </div>
        )}
      </form>

      {!hasSearch && (
        <>
          {recentSearches.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <Clock3 size={19} />
                  Recent searches
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowAllRecent(
                      (current) =>
                        !current
                    )
                  }
                  className="text-sm font-bold"
                >
                  {showAllRecent
                    ? "Show less"
                    : "Show all"}
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                {recentSearches
                  .slice(
                    0,
                    showAllRecent
                      ? 20
                      : 3
                  )
                  .map((item) => (
                    <button
                      type="button"
                      key={`${item.query}-${item.createdAt}`}
                      onClick={() =>
                        runSearch(
                          item.query
                        )
                      }
                      className="flex items-center justify-between rounded-2xl border-b border-[var(--border)] px-2 py-4 text-left font-bold"
                    >
                      <span>
                        {item.query}
                      </span>

                      <ChevronRight
                        size={18}
                      />
                    </button>
                  ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  void clearHistory()
                }
                className="mt-4 text-xs font-bold text-[var(--text-muted)]"
              >
                Clear search history
              </button>
            </section>
          )}

          <section className="mt-8">
            <h1 className="text-3xl font-black tracking-tight">
              Discover something new
            </h1>

            <p className="mt-2 text-[var(--text-muted)]">
              Pre-loved fashion, tech,
              collectibles and more from
              sellers across Sri Lanka.
            </p>

            <div className="mt-5 grid gap-4">
              {featuredCollections.map(
                (collection) => (
                  <Link
                    key={collection.title}
                    href={
                      collection.href
                    }
                    className="group relative overflow-hidden rounded-3xl"
                  >
                    <img
                      src={
                        collection.image
                      }
                      alt={
                        collection.title
                      }
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 md:h-72"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h2 className="text-2xl font-black">
                        {
                          collection.title
                        }
                      </h2>

                      <p className="mt-1 text-sm text-white/85">
                        {
                          collection.description
                        }
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black">
              Shop by category
            </h2>

            <div className="mt-4">
              {categories
                .filter(
                  (category) =>
                    category.parent_id ===
                    null
                )
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/search?category=${category.slug}`}
                    className="flex items-center justify-between border-b border-[var(--border)] py-5 text-xl font-bold"
                  >
                    <span>
                      {category.name}
                    </span>

                    <ChevronRight
                      size={22}
                    />
                  </Link>
                ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black">
              Popular this week
            </h2>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
              {popularSearches.map(
                (item) => (
                  <button
                    type="button"
                    key={item.query}
                    onClick={() =>
                      runSearch(
                        item.query
                      )
                    }
                    className="relative min-w-[230px] overflow-hidden rounded-3xl text-left sm:min-w-[280px]"
                  >
                    <img
                      src={item.image}
                      alt={item.query}
                      className="h-72 w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-0 p-5 text-white">
                      <p className="text-xl font-black">
                        {item.query}
                      </p>

                      <p className="mt-1 text-sm text-white/80">
                        {item.detail}
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Brands
              </h2>

              <span className="text-sm text-[var(--text-muted)]">
                Popular on Listed
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {featuredBrands.map(
                (brand) => (
                  <button
                    type="button"
                    key={brand}
                    onClick={() =>
                      runSearch(brand)
                    }
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-black"
                  >
                    {brand}
                  </button>
                )
              )}
            </div>
          </section>

          <section className="mt-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />

              <h2 className="text-xl font-black">
                Picks for you
              </h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Personal recommendations
              will appear here after the
              recommendation system is
              introduced. Search history,
              categories, saved items and
              listing interactions can later
              contribute to this section.
            </p>
          </section>
        </>
      )}

      {hasSearch && (
        <section className="mt-8">
          {didYouMean && (
            <p className="mb-5 rounded-2xl bg-[var(--surface)] p-4">
              Did you mean{" "}
              <button
                type="button"
                onClick={() =>
                  runSearch(didYouMean)
                }
                className="font-black underline"
              >
                {didYouMean}
              </button>
              ?
            </p>
          )}

          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">
                {filters.query
                  ? `Results for “${filters.query}”`
                  : "Browse listings"}
              </h1>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {total.toLocaleString()}{" "}
                {total === 1
                  ? "item"
                  : "items"}
              </p>
            </div>

            <Link
              href="/search"
              className="text-sm font-bold text-[var(--text-muted)]"
            >
              Clear
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {listings.map(
                (listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <Sparkles className="mx-auto" />

              <h2 className="mt-3 text-xl font-black">
                No exact matches yet
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Try another spelling, a
                broader category or fewer
                filters.
              </p>
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {filters.page > 1 && (
                <PageLink
                  direction="previous"
                  filters={filters}
                />
              )}

              <span className="text-sm font-bold">
                Page {filters.page} of{" "}
                {pageCount}
              </span>

              {filters.page <
                pageCount && (
                <PageLink
                  direction="next"
                  filters={filters}
                />
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function PageLink({
  direction,
  filters
}: {
  direction: "previous" | "next";
  filters: SearchFilters;
}) {
  const params =
    new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.category) {
    params.set(
      "category",
      filters.category
    );
  }

  if (
    filters.minimumPrice !== undefined
  ) {
    params.set(
      "min",
      String(filters.minimumPrice)
    );
  }

  if (
    filters.maximumPrice !== undefined
  ) {
    params.set(
      "max",
      String(filters.maximumPrice)
    );
  }

  if (filters.condition) {
    params.set(
      "condition",
      filters.condition
    );
  }

  params.set("sort", filters.sort);

  params.set(
    "page",
    String(
      filters.page +
        (direction === "next"
          ? 1
          : -1)
    )
  );

  return (
    <Link
      href={`/search?${params.toString()}`}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
      aria-label={`${direction} page`}
    >
      {direction === "next" ? (
        <ChevronRight size={18} />
      ) : (
        <ChevronLeft size={18} />
      )}
    </Link>
  );
}