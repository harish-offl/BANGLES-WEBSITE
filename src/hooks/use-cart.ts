"use client";

import { useEffect } from "react";

import { selectCount, selectSubtotal, useCartStore, type CartLine } from "@/stores/cart-store";

/**
 * Rehydrates the persisted cart on the client and flags when the store matches
 * storage. Until then, consumers render a stable empty state so the
 * server-rendered markup and the first client render agree.
 *
 * The root `CartProvider` performs the initial rehydration; this hook is a
 * safety net so the cart hooks also work in isolation (e.g. unit tests).
 */
export function useCartHydration(): boolean {
  const hydrated = useCartStore((s) => s.hydrated);

  useEffect(() => {
    if (useCartStore.getState().hydrated) return;
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      useCartStore.getState().setHydrated(true);
    });
  }, []);

  return hydrated;
}

export function useCartLines(): CartLine[] {
  const hydrated = useCartHydration();
  const lines = useCartStore((s) => s.lines);
  return hydrated ? lines : [];
}

export function useCartCount(): number {
  const hydrated = useCartHydration();
  const count = useCartStore(selectCount);
  return hydrated ? count : 0;
}

export function useCartSubtotal(): number {
  const hydrated = useCartHydration();
  const subtotal = useCartStore(selectSubtotal);
  return hydrated ? subtotal : 0;
}

export function useCartActions() {
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);
  const setIssues = useCartStore((s) => s.setIssues);
  return { add, remove, setQuantity, clear, setIssues };
}
