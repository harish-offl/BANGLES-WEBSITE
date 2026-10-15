"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistEntry {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  /** Last price seen by the client. Only a display hint; never authoritative. */
  price: number;
  addedAt: number;
}

interface WishlistState {
  items: WishlistEntry[];
  hydrated: boolean;
  toggle: (entry: WishlistEntry) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setHydrated: (value: boolean) => void;
}

/**
 * Saved-for-later list kept entirely in the browser, mirroring the cart store.
 * Nothing is written to the server, in keeping with the enquiry-only model.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      toggle: (entry) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === entry.productId);
          return exists
            ? { items: state.items.filter((i) => i.productId !== entry.productId) }
            : { items: [{ ...entry, addedAt: entry.addedAt || Date.now() }, ...state.items] };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      clear: () => set({ items: [] }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "bb-wishlist-v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
