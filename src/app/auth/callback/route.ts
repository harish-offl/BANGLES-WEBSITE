import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  if (!next.startsWith("/")) return "/customer/profile";
  if (next.startsWith("//")) return "/customer/profile";
  return ALLOWED_NEXT.has(next) || next.startsWith("/customer/profile")
    ? next
    : "/customer/profile";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? undefined;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
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
            // Route Handlers support cookie mutation; silent fallback only.
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Google sign-in couldn't be completed. Please try again.")}`,
        request.url,
      ),
    );
  }

  await ensureCustomerProfile();

  return NextResponse.redirect(new URL(safeNext(next), request.url));
}
