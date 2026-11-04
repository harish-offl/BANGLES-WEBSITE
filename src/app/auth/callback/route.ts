import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_NEXT = new Set(["/login/admin", "/admin", "/admin/dashboard", "/checkout", "/track-order"]);

function safeNext(next: string | undefined): string {
  if (!next) return "/login/admin";
  if (!next.startsWith("/")) return "/login/admin";
  if (next.startsWith("//")) return "/login/admin";
  return ALLOWED_NEXT.has(next) || next.startsWith("/login/admin") ? next : "/login/admin";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? undefined;

  if (!code) {
    return NextResponse.redirect(new URL("/login/admin?error=verification_failed", request.url));
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
        `/login/admin?error=${encodeURIComponent("Google sign-in couldn't be completed. Please try again.")}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(safeNext(next), request.url));
}
