import { redirect } from "next/navigation";

import { createAuthClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = new Set(["/account", "/account/orders", "/checkout", "/track-order"]);

function safeNext(next: string | undefined): string {
  if (!next) return "/account";
  // Only allow same-origin relative paths — never open redirects to external sites.
  if (!next.startsWith("/")) return "/account";
  if (next.startsWith("//")) return "/account";
  return ALLOWED_NEXT.has(next) || next.startsWith("/account") ? next : "/account";
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next } = await searchParams;

  if (!code) {
    redirect("/login?error=verification_failed");
  }

  const supabase = await createAuthClient();
  if (!supabase) {
    redirect("/login?error=auth_not_configured");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Google sign-in couldn't be completed. Please try again.")}`);
  }

  redirect(safeNext(next));
}