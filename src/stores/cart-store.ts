"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  /** Last price seen by the client. Always revalidated against the server. */
  unitPrice: number;
  variantId: string | null;
  variantLabel: string | null;
  quantity: number;
}

export interface CartValidationIssue {
  key: string;
  name: string;
  kind: "unavailable" | "price-changed";
  message: string;
  previousPrice?: number;
  currentPrice?: number;
}

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  /** Populated after each server-side validation pass. */
  issues: CartValidationIssue[];
  add: (line: CartLine) => void;
  remove: (productId: string, variantId?: string | null) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clear: () => void;
  setIssues: (issues: CartValidationIssue[]) => void;
  setHydrated: (value: boolean) => void;
}

export const cartKey = (productId: string, variantId?: string | null): string =>
  `${productId}::${variantId ?? ""}`;

/** Maximum quantity per line; keeps the enquiry readable for the store. */
export const MAX_LINE_QUANTITY = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      issues: [],

      add: (line) =>
        set((state) => {
          const key = cartKey(line.productId, line.variantId);
          const existing = state.lines.find(
            (l) => cartKey(l.productId, l.variantId) === key,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                cartKey(l.productId, l.variantId) === key
                  ? {
                      ...l,
                      quantity: Math.min(
                        MAX_LINE_QUANTITY,
                        l.quantity + Math.max(1, line.quantity),
                      ),
                      // Keep the freshest price/name we have been given.
                      unitPrice: line.unitPrice,
                      name: line.name,
                      imageUrl: line.imageUrl ?? l.imageUrl,
                    }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { ...line, quantity: Math.min(MAX_LINE_QUANTITY, Math.max(1, line.quantity)) },
            ],
          };
        }),

      remove: (productId, variantId = null) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => cartKey(l.productId, l.variantId) !== cartKey(productId, variantId),
          ),
        })),

      setQuantity: (productId, quantity, variantId = null) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter(
                  (l) => cartKey(l.productId, l.variantId) !== cartKey(productId, variantId),
                )
              : state.lines.map((l) =>
                  cartKey(l.productId, l.variantId) === cartKey(productId, variantId)
                    ? { ...l, quantity: Math.min(MAX_LINE_QUANTITY, Math.max(1, quantity)) }
                    : l,
                ),
        })),

      clear: () => set({ lines: [], issues: [] }),

      setIssues: (issues) => set({ issues }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "bb-cart-v1",
      version: 1,
      // Storage is only touched after mount to avoid server/client mismatches.
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function selectCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function selectSubtotal(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
