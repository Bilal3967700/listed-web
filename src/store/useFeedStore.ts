"use client";

import { create } from "zustand";
import { fakeListings } from "@/data/fakeListings";
import { Listing } from "@/types/listing";

interface FeedStore {
  listings: Listing[];
  toggleLike: (id: string) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  listings: fakeListings,
  toggleLike: (id: string) =>
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === id ? { ...listing, liked: !listing.liked } : listing
      )
    }))
}));