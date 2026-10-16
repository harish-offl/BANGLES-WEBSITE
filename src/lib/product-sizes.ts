/**
 * Shared bangle sizing rules.
 *
 * All bangles sold by the studio use the same five sizes. Sizes are therefore
 * a store-wide concept rather than per-product data: the product page only
 * needs to know whether the product is a bangle and it can render the full
 * selector. Larger sizes (2.10) carry a small handcrafting surcharge.
 *
 * This module has no server dependency so it can be imported from both the
 * server (cart re-pricing) and client components (product selector).
 */

export interface BangleSize {
  /** Display label and the value stored on the cart line, e.g. "2.10". */
  label: string;
  /** Extra rupees added to the base price for this size. */
  surcharge: number;
}

export const BANGLE_SIZES: BangleSize[] = [
  { label: "2.2", surcharge: 0 },
  { label: "2.4", surcharge: 0 },
  { label: "2.6", surcharge: 0 },
  { label: "2.8", surcharge: 0 },
  { label: "2.10", surcharge: 200 },
];

/** Pre-selected size on the product page. 2.6 is the most common fit. */
export const DEFAULT_BANGLE_SIZE = "2.6";

export interface SizeChartRow {
  size: string;
  /** Inner diameter in millimetres. */
  diameter: string;
  fit: string;
  popular?: boolean;
}

export const BANGLE_SIZE_CHART: SizeChartRow[] = [
  { size: "2.2", diameter: "54mm", fit: "XS" },
  { size: "2.4", diameter: "57mm", fit: "Small" },
  { size: "2.6", diameter: "60mm", fit: "Medium", popular: true },
  { size: "2.8", diameter: "63mm", fit: "Large" },
  { size: "2.10", diameter: "67mm", fit: "XL" },
];

/**
 * Bangle sizing only applies to bangle products. The category name is matched
 * loosely so it works for "Bangle", "Bridal bangles", "Glass Bangles", etc.
 */
export function isBangleCategory(categoryName?: string | null): boolean {
  return Boolean(categoryName && /bangle/i.test(categoryName));
}

/** Surcharge in rupees for a size label; unknown or missing sizes cost nothing. */
export function getSizeSurcharge(size?: string | null): number {
  if (!size) return 0;
  const match = BANGLE_SIZES.find((s) => s.label === size.trim());
  return match?.surcharge ?? 0;
}

/** Whether a label is one of the offered bangle sizes. */
export function isValidBangleSize(size?: string | null): boolean {
  if (!size) return false;
  return BANGLE_SIZES.some((s) => s.label === size.trim());
}

/** Human-readable size label, e.g. "2.10 (XL)", falling back to "—". */
export function formatBangleSize(size?: string | null): string {
  if (!size) return "—";
  const row = BANGLE_SIZE_CHART.find((r) => r.size === size.trim());
  return row ? `${row.size} (${row.fit})` : size.trim();
}
