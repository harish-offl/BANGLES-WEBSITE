"use server";

import { cache } from "react";

import { createAuthClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/data";
import type { Order } from "@/types";

/**
 * Returns the currently signed-in customer identity from Supabase Auth,
 * reading the profile from `public.profiles`.
 *
 * Returns `null` when no session exists or Supabase is not configured.
 * Wrapped in React `cache()` so multiple components in one request share
 * a single lookup.
 */
export interface CustomerIdentity {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailConfirmed: boolean;
}

export const getCustomerIdentity = cache(async (): Promise<CustomerIdentity | null> => {
  try {
    const supabase = await createAuthClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, phone, email, avatar_url, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) return null;

    return {
      userId: user.id,
      email: user.email ?? profile.email ?? null,
      fullName: profile.display_name ?? null,
      phone: profile.phone ?? null,
      avatarUrl: profile.avatar_url ?? null,
      emailConfirmed: user.email_confirmed_at ? true : false,
    };
  } catch {
    return null;
  }
});

/**
 * Ensures a customer profile row exists for the signed-in user.
 * Used after OAuth sign-in (e.g. Google) to bridge any timing gap between
 * session creation and the database `handle_new_user` trigger.
 *
 * Returns the user id when a profile exists or was created, null otherwise.
 */
export async function ensureCustomerProfile(): Promise<string | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if profile already exists.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return user.id;

  // Build profile from auth user metadata, mirroring handle_new_user.
  const meta = (user as any).user_metadata ?? {};
  const display_name =
    meta.full_name ?? meta.name ?? meta.display_name ?? splitEmailLocal(user.email ?? "");
  const email = meta.email ?? user.email ?? null;
  const phone = meta.phone ?? meta.phone_number ?? null;
  const avatar_url = meta.avatar_url ?? meta.picture ?? meta.avatar ?? null;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name,
    email,
    phone,
    avatar_url,
  });

  if (error) {
    // Profile may have been created by the trigger concurrently; try again.
    const { data: retry } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (retry) return user.id;
    return null;
  }

  return user.id;
}

function splitEmailLocal(email: string): string {
  return email.split("@")[0] ?? "Customer";
}

/**
 * Returns true when a customer is signed in.
 */
export const isCustomerAuthenticated = cache(async (): Promise<boolean> => {
  const identity = await getCustomerIdentity();
  return identity !== null;
});

/**
 * Lists the orders belonging to the currently signed-in customer.
 *
 * Reads through the service-role client after verifying the caller is
 * authenticated, then filters to the caller's own orders. Customers can
 * never see another customer's orders.
 */
export async function getCustomerOrders(): Promise<Order[]> {
  const identity = await getCustomerIdentity();
  if (!identity) return [];
  return getCatalog().listCustomerOrders(identity.userId);
}

/**
 * Returns a single order belonging to the current customer, or null if it
 * doesn't exist or belongs to another customer.
 */
export async function getCustomerOrderById(id: string): Promise<Order | null> {
  const identity = await getCustomerIdentity();
  if (!identity) return null;
  return getCatalog().getCustomerOrderById(identity.userId, id);
}
