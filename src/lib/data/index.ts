import "server-only";

import type { CatalogDriver } from "./driver";
import { getDataModeInfo, isLocalCatalogMode, isSupabaseConfigured } from "./driver";
import { localDriver } from "./local";
import { supabaseDriver } from "./supabase";

export * from "./driver";
export {
  getAvailableStock,
  getDiscount,
  getPurchaseState,
  getStockLabel,
  isVariantAvailable,
  slugify,
  type Discount,
  type PurchaseState,
} from "@/lib/product-utils";

/**
 * Single entry point for catalogue data.
 *
 * - Supabase (production source of truth) when credentials are configured.
 * - A copy of the audited legacy catalogue for local development and automated
 *   tests when Supabase is not configured, or when CATALOG_MODE=local is set
 *   during development.
 *
 * This is not a second production database: `.data/catalog.json` is a
 * development fixture. See docs/architecture.md.
 */
export function getCatalog(): CatalogDriver {
  return isLocalCatalogMode() || !isSupabaseConfigured() ? localDriver : supabaseDriver;
}

export { getDataModeInfo };
