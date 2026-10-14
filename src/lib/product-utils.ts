import type { Product, ProductVariant } from "@/types";

/**
 * Pure catalogue helpers with no server dependencies.
 *
 * These are imported by both Server Components and client components, so they
 * deliberately avoid the `server-only` marker used by the data layer.
 */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export interface PurchaseState {
  available: boolean;
  reason: string | null;
}

/**
 * A product can be added to the bag unless it is unpublished or an explicitly
 * tracked stock count has reached zero. `stock_quantity === null` means
 * inventory is not tracked (most of the catalogue is made to order), so the
 * product stays purchasable.
 */
export function getPurchaseState(product: Product): PurchaseState {
  if (product.is_active === false) {
    return { available: false, reason: "This product is no longer available." };
  }
  if (product.stock_quantity !== null && product.stock_quantity <= 0) {
    return { available: false, reason: "Currently sold out" };
  }
  const variants = product.variants ?? [];
  if (variants.length > 0 && variants.every((v) => !isVariantAvailable(v))) {
    return { available: false, reason: "Every option is currently sold out" };
  }
  return { available: true, reason: null };
}

export function isVariantAvailable(variant: ProductVariant): boolean {
  if (!variant.is_active) return false;
  if (variant.stock_quantity === null) return true;
  return variant.stock_quantity > 0;
}

export interface Discount {
  /** Percentage rounded to a whole number, or `null` when there is no sale. */
  percent: number | null;
  savings: number | null;
}

/**
 * A discount only exists when a genuine `compare_at_price` is present *and*
 * greater than the selling price. Anything else reports `null` so the UI never
 * renders a misleading offer badge.
 */
export function getDiscount(product: Pick<Product, "price" | "compare_at_price">): Discount {
  const compare = product.compare_at_price;
  if (compare === null || compare === undefined) return { percent: null, savings: null };
  if (!(compare > product.price) || product.price <= 0) return { percent: null, savings: null };
  const savings = compare - product.price;
  const percent = Math.round((savings / compare) * 100);
  return { percent, savings };
}

/** Lowest tracked stock across the product and its variants, or `null`. */
export function getAvailableStock(product: Product): number | null {
  if (product.stock_quantity === null) return null;
  let stock = product.stock_quantity;
  for (const v of product.variants ?? []) {
    if (v.is_active && v.stock_quantity !== null) stock = Math.min(stock, v.stock_quantity);
  }
  return stock;
}

/** Human-readable stock label used on product pages. */
export function getStockLabel(product: Product): string | null {
  const state = getPurchaseState(product);
  if (!state.available) return state.reason;
  const stock = getAvailableStock(product);
  if (stock === null) return "Made to order";
  if (stock <= 3) return `Only ${stock} left`;
  return "In stock";
}
