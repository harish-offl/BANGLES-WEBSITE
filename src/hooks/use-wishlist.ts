"use client";

import { useEffect } from "react";

import { useWishlistStore, type WishlistEntry } from "@/stores/wishlist-store";

/**
 * Rehydrates the persisted saved list on the client. Until storage is read the
 * hooks report an empty list so server-rendered and first-client markup agree.
 * The root `CartProvider` performs the initial rehydration; this is a safety
 * net for isolated use (e.g. unit tests).
 */
export function useWishlistHydration(): boolean {
  const hydrated = useWishlistStore((s) => s.hydrated);

  useEffect(() => {
    if (useWishlistStore.getState().hydrated) return;
    void Promise.resolve(useWishlistStore.persist.rehydrate()).then(() => {
      useWishlistStore.getState().setHydrated(true);
    });
  }, []);

  return hydrated;
}

export function useWishlistItems(): WishlistEntry[] {
  const hydrated = useWishlistHydration();
  const items = useWishlistStore((s) => s.items);
  return hydrated ? items : [];
}

export function useWishlistCount(): number {
  const hydrated = useWishlistHydration();
  const count = useWishlistStore((s) => s.items.length);
  return hydrated ? count : 0;
}

export function useWishlistActions() {
  const toggle = useWishlistStore((s) => s.toggle);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  return { toggle, remove, clear };
}

/** True when the given product is saved. Returns false before hydration. */
export function useIsWishlisted(productId: string): boolean {
  const hydrated = useWishlistHydration();
  return useWishlistStore((s) => (hydrated ? s.items.some((i) => i.productId === productId) : false));
}
