import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { validateCartItems } from "@/lib/cart/validate";
import { enquirySchema } from "@/lib/validation/enquiry";

export const dynamic = "force-dynamic";

/**
 * Re-prices and re-checks a client bag against the catalogue.
 *
 * The cart UI calls this on load so shoppers see authoritative prices and
 * availability before they send an enquiry.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`cart-validate:${clientKey(request)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cart payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await validateCartItems(parsed.data.items);

  return NextResponse.json(
    {
      lines: result.lines,
      subtotal: result.subtotal,
      issues: result.issues,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
