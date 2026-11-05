"use server";

import { redirect } from "next/navigation";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";

interface CartItemRow {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    primary_image_url: string | null;
    price: number;
    sku: string | null;
  } | null;
}

export async function ensureCustomerCart(): Promise<string> {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/cart");

  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/cart?error=auth_not_configured");

  // Get or create cart
  const { data: existing } = await supabase
    .from("customer_cart")
    .select("id")
    .eq("user_id", identity.userId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("customer_cart")
    .insert({ user_id: identity.userId })
    .select("id")
    .single();
  if (error) redirect("/account/cart?error=cart_create_failed");
  return data.id as string;
}

export async function addToCustomerCart(productId: string, quantity = 1): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/cart");

  const cartId = await ensureCustomerCart();
  const supabase = await createAuthClient();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("customer_cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("customer_cart_items")
      .update({ quantity: (existing.quantity as number) + quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("customer_cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
    });
  }
}

export async function removeFromCustomerCart(cartItemId: string): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const supabase = await createAuthClient();
  if (!supabase) return;
  await supabase
    .from("customer_cart_items")
    .delete()
    .eq("id", cartItemId);
}

export async function updateCustomerCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity || quantity < 1) return;

  const supabase = await createAuthClient();
  if (!supabase) return;
  await supabase
    .from("customer_cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", cartItemId);
}

export async function getCustomerCart() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const supabase = await createAuthClient();
  if (!supabase) return null;

  const { data: cart } = await supabase
    .from("customer_cart")
    .select("id")
    .eq("user_id", identity.userId)
    .maybeSingle();

  if (!cart) return { items: [], total: 0 };

  const { data: items } = await supabase
    .from("customer_cart_items")
    .select("*, products:products(*, primary_image_url)")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });

  const cartItems = ((items ?? []) as CartItemRow[]).map((item) => {
    const product = item.products;
    return {
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      name: product?.name ?? "Product",
      imageUrl: product?.primary_image_url ?? null,
      price: product?.price ?? 0,
      sku: product?.sku ?? null,
      lineTotal: (product?.price ?? 0) * item.quantity,
    };
  });

  const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items: cartItems, total };
}
