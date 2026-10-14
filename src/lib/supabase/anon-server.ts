import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/data/driver";

/**
 * Anonymous client for public, server-side catalogue reads.
 *
 * RLS still applies: this client only sees active, published rows. It is
 * created lazily so the application boots and builds without Supabase
 * credentials (local development mode).
 */
let client: SupabaseClient | null = null;

export function getAnonServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
