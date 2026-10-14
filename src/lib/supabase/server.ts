import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/data/driver";

/**
 * Cookie-aware Supabase client for Server Components, Server Actions and
 * Route Handlers. The session cookie is what drives server-side identity, so
 * the signed-in user is always re-verified on the server rather than trusted
 * from client-supplied values.
 *
 * Returns `null` when Supabase is not configured (local development mode).
 */
export async function createAuthClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Mutations are handled by the login/logout route handlers.
          }
        },
      },
    },
  );
}
