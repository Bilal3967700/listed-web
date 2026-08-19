import { Listing } from "@/types/listing";

export type SearchSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc";

export type SearchFilters = {
  query: string;
  category?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  condition?: string;
  sort: SearchSort;
  page: number;
};

export type SearchResult = {
  listings: Listing[];
  total: number;
};

export type SearchSuggestion = {
  suggestion: string;
  suggestion_type: "category" | "brand" | "item";
  category_slug: string | null;
  score: number;
};

export type RecentSearch = {
  query: string;
  createdAt: string;
};