import "server-only";

import { cache } from "react";

import { createAuthClient } from "@/lib/supabase/server";
import type { AdminUser, ProfileRole } from "@/types";

export interface AuthIdentity {
  userId: string;
  email: string;
  role: ProfileRole;
  displayName: string | null;
}

/**
 * Resolves the signed-in user and their role from the database.
 *
 * The role is read from `profiles.role` (which RLS prevents a user from
 * elevating for themselves) — never from JWT metadata supplied by the client.
 * Wrapped in React `cache()` so multiple components in one request share a
 * single lookup.
 *
 * Returns `null` when there is no session or when Supabase is not configured.
 */
export const getIdentity = cache(async (): Promise<AuthIdentity | null> => {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? "",
    role: (profile?.role as ProfileRole | undefined) ?? "customer",
    displayName: profile?.display_name ?? null,
  };
});

export const isAdmin = cache(async (): Promise<boolean> => {
  const identity = await getIdentity();
  return identity?.role === "admin";
});

export class AuthError extends Error {
  readonly status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Server-side guard for administrative route handlers and Server Actions.
 * Throws `AuthError` so callers can map it to a 401/403 response. Never rely
 * on hidden UI or redirects alone for access control.
 */
export async function requireAdmin(): Promise<AuthIdentity> {
  const identity = await getIdentity();
  if (!identity) throw new AuthError("Authentication required.", 401);
  if (identity.role !== "admin") throw new AuthError("Administrator access required.", 403);
  return identity;
}

/** Convenience shape used by the admin dashboard. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const identity = await getIdentity();
  if (!identity) return null;
  return {
    id: identity.userId,
    email: identity.email,
    role: identity.role,
    display_name: identity.displayName,
  };
}
