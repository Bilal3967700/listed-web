export type ListingCategory =
  | "New In"
  | "Trending"
  | "Vintage"
  | "Clothing"
  | "Shoes"
  | "Bags"
  | "Watches"
  | "Collectibles"
  | "Tech"
  | "Phones"
  | "Laptops"
  | "Cameras"
  | "Home";

export interface Listing {
  id: string;
  title: string;
  brand: string;
  description: string;
  priceLkr: number;
  category: ListingCategory;
  condition: string;
  size?: string;
  suburb: string;
  sellerName: string;
  isVerifiedSeller: boolean;
  liked: boolean;
  imageUrl: string;
  createdAt: string;
}