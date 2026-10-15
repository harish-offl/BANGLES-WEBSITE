"use server";

import { getCatalog } from "@/lib/data";
import type { Product } from "@/types";

/**
 * Resolves the browser-only saved list into full catalogue products. Ids are
 * validated and capped so a tampered client cannot request the whole table.
 * Returns products in the order the shopper saved them.
 */
export async function loadWishlistProducts(ids: string[]): Promise<Product[]> {
  const clean = ids
    .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 100)
    .slice(0, 100);

  if (clean.length === 0) return [];

  const products = await getCatalog().getProductsByIds(clean);
  const byId = new Map(products.map((product) => [product.id, product]));
  return clean.map((id) => byId.get(id)).filter((product): product is Product => Boolean(product));
}
