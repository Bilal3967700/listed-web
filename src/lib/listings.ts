import { createClient } from "@/lib/supabase/server";
import {
  EditableListing,
  Listing,
  ListingPhoto
} from "@/types/listing";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ListingPhotoRow = {
  listing_id: string;
  image_url: string;
  sort_order: number;
  is_cover: boolean;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  is_verified_seller: boolean | null;
};

type ListingRow = {
  id: string;
  title: string;
  brand: string | null;
  description: string;
  price_lkr: number;
  condition: string;
  size: string | null;
  seller_id: string;
  category_id: string | null;
  created_at: string;
};

function buildCategoryDescendants(
  categories: CategoryRow[],
  parentId: string
): string[] {
  const children = categories.filter((category) => category.parent_id === parentId);

  return children.flatMap((child) => [
    child.id,
    ...buildCategoryDescendants(categories, child.id)
  ]);
}

function mapListing({
  listing,
  category,
  profile,
  photos
}: {
  listing: ListingRow;
  category?: CategoryRow;
  profile?: ProfileRow;
  photos: ListingPhotoRow[];
}): Listing {
  const orderedPhotos = [...photos].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.sort_order - b.sort_order;
  });

  const imageUrls = orderedPhotos.map((photo) => photo.image_url);

  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    description: listing.description,
    priceLkr: listing.price_lkr,
    category: category?.name || "Listed",
    condition: listing.condition,
    size: listing.size,
    sellerId: listing.seller_id,
    sellerName:
      profile?.full_name ||
      profile?.username ||
      "Listed seller",
    sellerUsername: profile?.username || "seller",
    isVerifiedSeller: Boolean(profile?.is_verified_seller),
    imageUrl:
      imageUrls[0] ||
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
    imageUrls,
    createdAt: listing.created_at
  };
}

async function hydrateListings(listings: ListingRow[]) {
  const supabase = await createClient();

  if (listings.length === 0) {
    return [];
  }

  const listingIds = listings.map((listing) => listing.id);
  const sellerIds = [...new Set(listings.map((listing) => listing.seller_id))];
  const categoryIds = [
    ...new Set(
      listings
        .map((listing) => listing.category_id)
        .filter((id): id is string => Boolean(id))
    )
  ];

  const [{ data: photos }, { data: profiles }, { data: categories }] =
    await Promise.all([
      supabase
        .from("listing_photos")
        .select("listing_id, image_url, sort_order, is_cover")
        .in("listing_id", listingIds)
        .order("sort_order", { ascending: true }),

      supabase
        .from("profiles")
        .select("id, username, full_name, is_verified_seller")
        .in("id", sellerIds),

      categoryIds.length > 0
        ? supabase
            .from("categories")
            .select("id, name, slug, parent_id")
            .in("id", categoryIds)
        : Promise.resolve({ data: [] as CategoryRow[] })
    ]);

  return listings.map((listing) =>
    mapListing({
      listing,
      category: (categories || []).find(
        (category) => category.id === listing.category_id
      ),
      profile: (profiles || []).find(
        (profile) => profile.id === listing.seller_id
      ),
      photos: (photos || []).filter(
        (photo) => photo.listing_id === listing.id
      )
    })
  );
}

export async function getActiveListings(categorySlug?: string) {
  const supabase = await createClient();

  let categoryIds: string[] | null = null;

  if (categorySlug && categorySlug !== "new-in") {
    const { data: allCategories } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("is_active", true);

    const selectedCategory = allCategories?.find(
      (category) => category.slug === categorySlug
    );

    if (selectedCategory) {
      categoryIds = [
        selectedCategory.id,
        ...buildCategoryDescendants(allCategories || [], selectedCategory.id)
      ];
    }
  }

  let query = supabase
    .from("listings")
    .select(`
      id,
      title,
      brand,
      description,
      price_lkr,
      condition,
      size,
      seller_id,
      category_id,
      created_at
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getActiveListings error:", error.message);
    return [];
  }

  return hydrateListings((data || []) as ListingRow[]);
}

export async function getListingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      brand,
      description,
      price_lkr,
      condition,
      size,
      seller_id,
      category_id,
      created_at
    `)
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !data) {
    console.error("getListingById error:", error?.message);
    return null;
  }

  const listings = await hydrateListings([data as ListingRow]);

  return listings[0] || null;
}

export async function getListingsBySellerId(sellerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      brand,
      description,
      price_lkr,
      condition,
      size,
      seller_id,
      category_id,
      created_at
    `)
    .eq("seller_id", sellerId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getListingsBySellerId error:", error.message);
    return [];
  }

  return hydrateListings((data || []) as ListingRow[]);
}

export async function getEditableListingById(
  listingId: string,
  userId: string
): Promise<EditableListing | null> {
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      brand,
      description,
      price_lkr,
      condition,
      size,
      seller_id,
      category_id
    `)
    .eq("id", listingId)
    .eq("seller_id", userId)
    .eq("status", "active")
    .single();

  if (error || !listing) {
    console.error(
      "getEditableListingById error:",
      error?.message
    );

    return null;
  }

  const { data: photos, error: photosError } =
    await supabase
      .from("listing_photos")
      .select(`
        id,
        listing_id,
        image_url,
        storage_path,
        sort_order,
        is_cover
      `)
      .eq("listing_id", listingId)
      .order("is_cover", {
        ascending: false
      })
      .order("sort_order", {
        ascending: true
      });

  if (photosError) {
    console.error(
      "getEditableListingById photos error:",
      photosError.message
    );

    return null;
  }

  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    description: listing.description,
    priceLkr: listing.price_lkr,
    condition: listing.condition,
    size: listing.size,
    sellerId: listing.seller_id,
    categoryId: listing.category_id,
    photos: (photos || []) as ListingPhoto[]
  };
}