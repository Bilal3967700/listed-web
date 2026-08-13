export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface Listing {
  id: string;
  title: string;
  brand: string | null;
  description: string;
  priceLkr: number;
  category: string;
  condition: string;
  size: string | null;
  sellerId: string;
  sellerName: string;
  sellerUsername: string;
  isVerifiedSeller: boolean;
  imageUrl: string;
  imageUrls: string[];
  createdAt: string;
}