import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { recordPaymentEvent, updateOrderPayment } from "@/lib/razorpay/store";
import { verifyPaymentSignature } from "@/lib/razorpay/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const limit = rateLimit(`razorpay-verify:${clientKey(request)}`, 15, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  if (!verifyPaymentSignature(parsed.data)) {
    return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
  }

  try {
    const updated = await updateOrderPayment({
      razorpay_order_id: parsed.data.razorpay_order_id,
      razorpay_payment_id: parsed.data.razorpay_payment_id,
      status: "paid",
    });
    if (!updated) {
      return NextResponse.json({ error: "Order not found or already processed." }, { status: 404 });
    }
    await recordPaymentEvent({
      event_id: `verify:${parsed.data.razorpay_payment_id}`,
      event_type: "payment.verified",
      internal_order_id: updated.id,
      processing_status: "processed",
    });
    return NextResponse.json({
      orderId: updated.id,
      order_number: updated.order_number,
      status: updated.payment_status,
      total_amount: updated.total_amount,
      currency: updated.currency,
    });
  } catch {
    return NextResponse.json(
      { error: "Payment verification failed. Please contact us." },
      { status: 500 },
    );
  }
}
