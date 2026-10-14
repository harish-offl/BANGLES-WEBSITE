"use client";

import { useEffect, type ReactNode } from "react";

import { useCartStore } from "@/stores/cart-store";

/**
 * Mounts cart persistence for the whole application. Kept as a single client
 * boundary in the root layout so no page has to remember to rehydrate.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      useCartStore.getState().setHydrated(true);
    });
  }, []);

  return <>{children}</>;
}
