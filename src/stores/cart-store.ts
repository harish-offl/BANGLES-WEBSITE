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
  /** Selected bangle size, e.g. "2.10"; null for non-bangles. */
  size: string | null;
  /** Selected colour option; null when the product has no colour choice. */
  colour: string | null;
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
  remove: (
    productId: string,
    variantId?: string | null,
    size?: string | null,
    colour?: string | null,
  ) => void;
  setQuantity: (
    productId: string,
    quantity: number,
    variantId?: string | null,
    size?: string | null,
    colour?: string | null,
  ) => void;
  clear: () => void;
  setIssues: (issues: CartValidationIssue[]) => void;
  setHydrated: (value: boolean) => void;
}

/**
 * A line is identified by product + variant + size + colour, so the same bangle
 * in two sizes or colours is kept as two separate bag lines.
 */
export const cartKey = (
  productId: string,
  variantId?: string | null,
  size?: string | null,
  colour?: string | null,
): string => `${productId}::${variantId ?? ""}::${size ?? ""}::${colour ?? ""}`;

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
          const key = cartKey(line.productId, line.variantId, line.size, line.colour);
          const existing = state.lines.find(
            (l) => cartKey(l.productId, l.variantId, l.size, l.colour) === key,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                cartKey(l.productId, l.variantId, l.size, l.colour) === key
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

      remove: (productId, variantId = null, size = null, colour = null) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) =>
              cartKey(l.productId, l.variantId, l.size, l.colour) !==
              cartKey(productId, variantId, size, colour),
          ),
        })),

      setQuantity: (productId, quantity, variantId = null, size = null, colour = null) =>
        set((state) => {
          const target = cartKey(productId, variantId, size, colour);
          return {
            lines:
              quantity <= 0
                ? state.lines.filter(
                    (l) => cartKey(l.productId, l.variantId, l.size, l.colour) !== target,
                  )
                : state.lines.map((l) =>
                    cartKey(l.productId, l.variantId, l.size, l.colour) === target
                      ? { ...l, quantity: Math.min(MAX_LINE_QUANTITY, Math.max(1, quantity)) }
                      : l,
                  ),
          };
        }),

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
