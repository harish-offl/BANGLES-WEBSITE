import "server-only";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";

interface WishlistItemRow {
  product_id: string;
  products: {
    name: string;
    primary_image_url: string | null;
    price: number;
    sku: string | null;
  } | null;
}

export async function getCustomerWishlist() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const supabase = await createAuthClient();
  if (!supabase) return null;

  const { data: items } = await supabase
    .from("customer_wishlist")
    .select("*, products:products(*, primary_image_url, sku, price)")
    .eq("user_id", identity.userId)
    .order("created_at", { ascending: false });

  const wishlistItems = ((items ?? []) as WishlistItemRow[]).map((item) => {
    const product = item.products;
    return {
      productId: item.product_id,
      name: product?.name ?? "Product",
      imageUrl: product?.primary_image_url ?? null,
      price: product?.price ?? 0,
      sku: product?.sku ?? null,
    };
  });

  return { items: wishlistItems };
}

export async function addToWishlist(productId: string): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const supabase = await createAuthClient();
  if (!supabase) return;
  await supabase.from("customer_wishlist").upsert({
    user_id: identity.userId,
    product_id: productId,
  }, { onConflict: "user_id,product_id" });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const supabase = await createAuthClient();
  if (!supabase) return;
  await supabase
    .from("customer_wishlist")
    .delete()
    .eq("user_id", identity.userId)
    .eq("product_id", productId);
}
