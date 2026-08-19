import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/types/listing";
import {
  SearchFilters,
  SearchResult,
  SearchSuggestion
} from "@/types/search";

type SearchRow = {
  id: string;
  title: string;
  brand: string | null;
  description: string;
  price_lkr: number;
  condition: string;
  size: string | null;
  seller_id: string;
  category_id: string | null;
  category_name: string | null;
  seller_name: string;
  seller_username: string;
  is_verified_seller: boolean;
  image_url: string | null;
  created_at: string;
  relevance: number;
  total_count: number;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop";

function mapSearchRow(row: SearchRow): Listing {
  const imageUrl = row.image_url || fallbackImage;

  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    description: row.description,
    priceLkr: row.price_lkr,
    category: row.category_name || "Listed",
    condition: row.condition,
    size: row.size,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    sellerUsername: row.seller_username,
    isVerifiedSeller: row.is_verified_seller,
    imageUrl,
    imageUrls: [imageUrl],
    createdAt: row.created_at
  };
}

export async function searchListings(
  filters: SearchFilters
): Promise<SearchResult> {
  const supabase = await createClient();
  const pageSize = 24;

  const { data, error } = await supabase.rpc(
    "search_listings",
    {
      p_search_query: filters.query,
      p_category_slug: filters.category || null,
      p_minimum_price: filters.minimumPrice ?? null,
      p_maximum_price: filters.maximumPrice ?? null,
      p_condition: filters.condition || null,
      p_sort_by: filters.sort,
      p_page_size: pageSize,
      p_page_offset: (filters.page - 1) * pageSize
    }
  );

  if (error) {
    console.error(
      "searchListings error:",
      error.message
    );

    return {
      listings: [],
      total: 0
    };
  }

  const rows = (data || []) as SearchRow[];

  return {
    listings: rows.map(mapSearchRow),
    total: Number(rows[0]?.total_count || 0)
  };
}

export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "search_suggestions",
    {
      p_search_query: cleanQuery,
      p_suggestion_limit: 8
    }
  );

  if (error) {
    console.error(
      "getSearchSuggestions error:",
      error.message
    );

    return [];
  }

  return (data || []) as SearchSuggestion[];
}