export type ListingCategory =
  | "New In"
  | "Trending"
  | "Fashion"
  | "Bags"
  | "Shoes"
  | "Watches"
  | "Jewellery"
  | "Tech"
  | "Phones"
  | "Laptops";

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