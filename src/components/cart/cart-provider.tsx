"use client";

import { useEffect, type ReactNode } from "react";

import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * Mounts cart and saved-list persistence for the whole application. Kept as a
 * single client boundary in the root layout so no page has to remember to
 * rehydrate.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      useCartStore.getState().setHydrated(true);
    });
    void Promise.resolve(useWishlistStore.persist.rehydrate()).then(() => {
      useWishlistStore.getState().setHydrated(true);
    });
  }, []);

  return <>{children}</>;
}
