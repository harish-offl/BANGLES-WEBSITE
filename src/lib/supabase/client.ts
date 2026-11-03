import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser (Client Components).
 *
 * Reads/writes auth cookies so the session persists across page navigations
 * and server actions. Safe to import from Client Components and event handlers.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
}

/**
 * Returns true when Supabase credentials are configured. Use this to gate
 * auth UI so the app degrades gracefully in local development mode.
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
