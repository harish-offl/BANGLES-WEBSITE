import "server-only";

import { getCatalog } from "@/lib/data";
import {
  getSizeSurcharge,
  isBangleCategory,
  isGlassBanglesCategory,
  isValidBangleSize,
} from "@/lib/product-sizes";
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
  /** Validated bangle size, or null for non-bangles/invalid sizes. */
  size: string | null;
  /** Validated colour option, or null when not offered. */
  colour: string | null;
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
    const key = `${item.productId}::${item.variantId ?? ""}::${item.size ?? ""}::${item.colour ?? ""}`;
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
        size: null,
        colour: null,
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

    const appliesSize = isBangleCategory(product.category_name);
    const isGlass = isGlassBanglesCategory(product.category_name);
    const activeVariants = (product.variants ?? []).filter((v) => v.is_active);
    const requestedSize = appliesSize ? item.size?.trim() ?? null : null;
    const requestedColour = item.colour?.trim() ?? null;

    let variant = item.variantId
      ? activeVariants.find((v) => v.id === item.variantId) ?? null
      : null;
    const variantMissingById = Boolean(item.variantId) && !variant;

    // Older carts may not carry a variant id. Resolve the option from the
    // colour and size so the server still prices and stocks the right row.
    if (!variant && !item.variantId && isGlass && activeVariants.length > 0) {
      variant =
        activeVariants.find((v) => {
          const size = (v.size ?? v.variant_value).trim().toLowerCase();
          const colour = (v.colour ?? "").trim().toLowerCase();
          return (
            (!requestedSize || size === requestedSize.toLowerCase()) &&
            (!requestedColour || colour === requestedColour.toLowerCase())
          );
        }) ?? null;
    }

    const variantSize = variant
      ? (variant.size ?? variant.variant_value).trim()
      : null;
    const variantColour = variant?.colour?.trim() || null;
    const optionMismatch =
      Boolean(variant) &&
      ((requestedSize &&
        variantSize &&
        requestedSize.toLowerCase() !== variantSize.toLowerCase()) ||
        (requestedColour &&
          variantColour &&
          requestedColour.toLowerCase() !== variantColour.toLowerCase()));
    const requiresVariant = isGlass && activeVariants.length > 0;
    const variantMissing =
      variantMissingById || optionMismatch || (requiresVariant && !variant);

    let available: boolean;
    let stockLabel: string | null;

    if (variantMissing) {
      available = false;
      stockLabel = "Option unavailable";
    } else if (variant) {
      const trackedStock = variant.stock_quantity;
      available =
        isVariantAvailable(variant) &&
        (trackedStock === null || item.quantity <= trackedStock);
      stockLabel = isVariantAvailable(variant)
        ? trackedStock === null
          ? "Made to order"
          : `${trackedStock} available`
        : "Sold out";
    } else {
      const purchase = getPurchaseState(product);
      available =
        purchase.available &&
        (product.stock_quantity === null || item.quantity <= product.stock_quantity);
      stockLabel = getStockLabel(product);
    }

    const resolvedSize = appliesSize
      ? variant
        ? variantSize
        : isValidBangleSize(requestedSize)
          ? requestedSize
          : null
      : null;
    const requestedColourMatch = product.colours?.find(
      (colour) => colour.toLowerCase() === requestedColour?.toLowerCase(),
    );
    const resolvedColour = variantColour ?? requestedColourMatch ?? null;
    const sizeSurcharge = appliesSize ? getSizeSurcharge(resolvedSize) : 0;

    const unitPrice = available
      ? (variant?.price_override ?? product.price) + sizeSurcharge
      : null;
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
      size: resolvedSize,
      colour: resolvedColour,
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
          ? optionMismatch
            ? "The selected colour or size is no longer available."
            : requiresVariant && !variant
              ? "Please choose an available colour and size."
              : "The selected option is no longer offered."
          : variant &&
              variant.stock_quantity !== null &&
              item.quantity > variant.stock_quantity
            ? `Only ${variant.stock_quantity} left in this size.`
            : "This item is currently unavailable.",
      });
    }
  }

  const purchasable = lines.filter((line) => line.available && line.lineTotal !== null);
  const subtotal = purchasable.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0);

  return { lines, purchasable, subtotal, issues };
}

export const dataMode = isSupabaseConfigured() ? "supabase" : "local";
