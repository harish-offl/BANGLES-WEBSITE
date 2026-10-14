import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/data/driver";

/**
 * Service-role client. Grants bypass of Row Level Security and must never be
 * exposed to the browser — this module is guarded by `server-only` and the
 * key is read from a non `NEXT_PUBLIC_` environment variable.
 *
 * Used only inside server route handlers for privileged catalogue writes and
 * storage operations, after an explicit admin role check has passed.
 */
export function getServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (isSupabaseConfigured()) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Server-side admin mutations require it.",
      );
    }
    throw new Error("Supabase is not configured; service-role client unavailable.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}
