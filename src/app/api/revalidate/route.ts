import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * On-demand cache revalidation for the storefront.
 *
 * Guarded by a shared secret so it is safe to expose on a public URL. The
 * secret is read from `REVALIDATE_SECRET`; when it is not configured the
 * endpoint is disabled rather than defaulting to open.
 *
 * Usage:
 *   POST /api/revalidate
 *   Header: x-revalidate-secret: <secret>
 *   Body:   { "paths": ["/", "/privacy-policy"] }
 *           { "scope": "all" }  // purges every cached route
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "On-demand revalidation is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!safeEqual(provided, secret)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const payload = (body ?? {}) as { scope?: unknown; paths?: unknown };

  const revalidated: string[] = [];

  if (payload.scope === "all") {
    revalidatePath("/", "layout");
    revalidated.push("/ (all)");
  }

  if (Array.isArray(payload.paths)) {
    for (const value of payload.paths) {
      if (typeof value !== "string" || value.length === 0 || value.length > 1024) continue;
      if (!value.startsWith("/")) continue;
      revalidatePath(value);
      revalidated.push(value);
    }
  }

  // The sitemap is commonly stale after catalogue edits.
  revalidatePath("/sitemap.xml");
  revalidated.push("/sitemap.xml");

  if (revalidated.length === 0) {
    return NextResponse.json(
      { revalidated: false, message: "Nothing to revalidate. Provide scope or paths." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { revalidated: true, paths: revalidated, now: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Constant-time comparison that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
