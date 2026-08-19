import { DiscoverClient } from "@/components/search/DiscoverClient";
import {
  getSearchSuggestions,
  searchListings
} from "@/lib/search";

import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/listing";

import {
  SearchFilters,
  SearchSort
} from "@/types/search";

type SearchParams = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  condition?: string;
  sort?: string;
  page?: string;
  sid?: string;
};

function positiveNumber(
  value?: string
) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return undefined;
  }

  return Math.round(number);
}

function validSort(
  value?: string
): SearchSort {
  const validValues: SearchSort[] = [
    "relevance",
    "newest",
    "price_asc",
    "price_desc"
  ];

  return validValues.includes(
    value as SearchSort
  )
    ? (value as SearchSort)
    : "relevance";
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters: SearchFilters = {
    query:
      params.q
        ?.trim()
        .slice(0, 100) || "",

    category:
      params.category || undefined,

    minimumPrice:
      positiveNumber(params.min),

    maximumPrice:
      positiveNumber(params.max),

    condition:
      params.condition || undefined,

    sort: validSort(params.sort),

    page: Math.max(
      1,
      positiveNumber(params.page) || 1
    )
  };

  const hasSearch = Boolean(
    filters.query ||
      filters.category ||
      filters.minimumPrice !== undefined ||
      filters.maximumPrice !== undefined ||
      filters.condition
  );

  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [
    categoriesResult,
    searchResult,
    historyResult
  ] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, name, slug, parent_id, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true
      }),

    hasSearch
      ? searchListings(filters)
      : Promise.resolve({
          listings: [],
          total: 0
        }),

    user
      ? supabase
          .from("search_history")
          .select(
            "query, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false
          })
          .limit(20)
      : Promise.resolve({
          data: [] as {
            query: string;
            created_at: string;
          }[]
        })
  ]);

  let didYouMean: string | null =
    null;

  if (
    filters.query.length >= 2 &&
    searchResult.total === 0
  ) {
    const suggestions =
      await getSearchSuggestions(
        filters.query
      );

    didYouMean =
      suggestions.find(
        (item) =>
          item.suggestion.toLowerCase() !==
          filters.query.toLowerCase()
      )?.suggestion || null;
  }

  return (
    <DiscoverClient
      listings={
        searchResult.listings
      }
      total={searchResult.total}
      categories={
        (categoriesResult.data ||
          []) as Category[]
      }
      filters={filters}
      accountSearches={(
        historyResult.data || []
      ).map((item) => ({
        query: item.query,
        createdAt: item.created_at
      }))}
      userId={user?.id || null}
      didYouMean={didYouMean}
      searchEventId={
        params.sid || null
      }
    />
  );
}