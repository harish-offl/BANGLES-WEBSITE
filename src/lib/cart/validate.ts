import "server-only";

import { getCatalog } from "@/lib/data";
import { getPurchaseState, getStockLabel, isVariantAvailable } from "@/lib/product-utils";
import { isSupabaseConfigured } from "@/lib/data/driver";

import type { EnquiryItemValues } from "@/lib/validation/enquiry";

export interface CartIssue {
  productId: string;
  variantId: string | null;
  name: string;
  kind: "unavailable" | "price-changed" | "not-found";
  message: string;
}

export interface ValidatedLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  slug: string | null;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  variantLabel: string | null;
  /** Authoritative price from the catalogue, or `null` when unavailable. */
  unitPrice: number | null;
  lineTotal: number | null;
  available: boolean;
  stockLabel: string | null;
}

export interface CartValidationResult {
  lines: ValidatedLine[];
  /** Lines that can actually be enquired about, in requested order. */
  purchasable: ValidatedLine[];
  subtotal: number;
  issues: CartIssue[];
}

/**
 * Re-resolves a client basket against the catalogue.
 *
 * This is the single source of truth for prices and availability: the client's
 * stored prices are never trusted. Duplicate lines for the same product/variant
 * are merged so a tampered payload cannot inflate quantities.
 */
export async function validateCartItems(items: EnquiryItemValues[]): Promise<CartValidationResult> {
  const catalog = getCatalog();

  const merged = new Map<string, EnquiryItemValues>();
  for (const item of items) {
    const key = `${item.productId}::${item.variantId ?? ""}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + item.quantity);
    } else {
      merged.set(key, { ...item });
    }
  }

  const requested = [...merged.values()];
  const products = await catalog.getProductsByIds(requested.map((item) => item.productId));
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: ValidatedLine[] = [];
  const issues: CartIssue[] = [];

  for (const item of requested) {
    const product = byId.get(item.productId);

    if (!product) {
      lines.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        slug: null,
        name: "Unavailable product",
        imageUrl: null,
        sku: null,
        variantLabel: null,
        unitPrice: null,
        lineTotal: null,
        available: false,
        stockLabel: null,
      });
      issues.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        name: "Unavailable product",
        kind: "not-found",
        message: "This item is no longer in the catalogue and will be ignored.",
      });
      continue;
    }

    const variant = item.variantId
      ? (product.variants ?? []).find((v) => v.id === item.variantId) ?? null
      : null;

    const variantMissing = Boolean(item.variantId) && !variant;

    let available: boolean;
    let stockLabel: string | null;

    if (variantMissing) {
      available = false;
      stockLabel = "Option unavailable";
    } else if (variant) {
      available = isVariantAvailable(variant);
      stockLabel = available
        ? variant.stock_quantity === null
          ? "Made to order"
          : `${variant.stock_quantity} available`
        : "Sold out";
    } else {
      available = getPurchaseState(product).available;
      stockLabel = getStockLabel(product);
    }

    const unitPrice = available ? (variant?.price_override ?? product.price) : null;
    const lineTotal = unitPrice === null ? null : unitPrice * item.quantity;

    const line: ValidatedLine = {
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity: item.quantity,
      slug: product.slug,
      name: product.name,
      imageUrl: product.primary_image_url,
      sku: variant?.sku ?? product.sku,
      variantLabel: variant ? `${variant.variant_name}: ${variant.variant_value}` : null,
      unitPrice,
      lineTotal,
      available,
      stockLabel,
    };
    lines.push(line);

    if (!available) {
      issues.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        kind: "unavailable",
        message: variantMissing
          ? "The selected option is no longer offered."
          : "This item is currently unavailable.",
      });
    }
  }

  const purchasable = lines.filter((line) => line.available && line.lineTotal !== null);
  const subtotal = purchasable.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0);

  return { lines, purchasable, subtotal, issues };
}

export const dataMode = isSupabaseConfigured() ? "supabase" : "local";
