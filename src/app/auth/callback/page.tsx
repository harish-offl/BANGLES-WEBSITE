import { redirect } from "next/navigation";

import { createAuthClient } from "@/lib/supabase/server";
import { ensureCustomerProfile } from "@/lib/auth/auth-utils";

const ALLOWED_NEXT = new Set([
  "/customer/profile",
  "/customer/profile/orders",
  "/customer/profile/cart",
  "/checkout",
  "/track-order",
]);

function safeNext(next: string | undefined): string {
  if (!next) return "/customer/profile";
  // Only allow same-origin relative paths — never open redirects to external sites.
  if (!next.startsWith("/")) return "/customer/profile";
  if (next.startsWith("//")) return "/customer/profile";
  return ALLOWED_NEXT.has(next) || next.startsWith("/customer/profile")
    ? next
    : "/customer/profile";
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

  // Ensure the customer profile row exists so the dashboard can read it.
  await ensureCustomerProfile();

  redirect(safeNext(next));
}