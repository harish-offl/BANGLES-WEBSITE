"use server";

import { redirect } from "next/navigation";

import { createAuthClient } from "@/lib/supabase/server";

/**
 * Initiates Google OAuth sign-in.
 *
 * Returns the Google authorization URL the client must navigate to. We cannot
 * `redirect()` from here because the caller is a client component that wants
 * to handle loading/error state; returning the URL lets the client drive the
 * navigation and keeps the loading spinner visible until the redirect fires.
 *
 * The redirect target is derived from the request origin when possible so the
 * callback URL matches the actual deployment (dev port, Vercel preview, prod).
 */
export async function googleSignInAction(
  next = "/account",
): Promise<{ url?: string; error?: string }> {
  const supabase = await createAuthClient();
  if (!supabase) {
    return {
      error: "Authentication is not configured for this deployment.",
    };
  }

  // Prefer the configured site URL; fall back to the request origin so the
  // callback lands on the correct port in local development.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  let origin: string;
  if (configured) {
    origin = configured.replace(/\/$/, "");
  } else {
    // No server request headers available in this helper; default is fine.
    origin = "http://localhost:3000";
  }

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data?.url) {
    return {
      error: "Google sign-in couldn't be completed. Please try again.",
    };
  }

  return { url: data.url };
}