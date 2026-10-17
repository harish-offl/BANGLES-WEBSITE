import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/razorpay/client";
import { recordPaymentEvent } from "@/lib/razorpay/store";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

interface RazorpayWebhookEvent {
  id: string;
  event: string;
  payload: {
    order?: { entity: { id: string; amount: number; currency: string; status: string } };
    payment?: { entity: { id: string; order_id: string; amount: number; currency: string; status: string } };
  };
}

/**
 * Razorpay webhook. Reads the raw body, verifies the signature, deduplicates
 * by event id, and updates internal order state only from verified events.
 *
 * Webhook events are the authoritative source of payment status alongside
 * direct Checkout signature verification.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const supabase = getServiceRoleClient();

  // Deduplicate: ignore events we have already processed.
  const { data: existing } = await supabase
    .from("payment_events")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const orderEntity = event.payload.order?.entity ?? event.payload.payment?.entity;
  const paymentEntity = event.payload.payment?.entity;
  const razorpayOrderId = orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;
  const paymentStatus = paymentEntity?.status ?? orderEntity?.status;

  let internalOrderId: string | null = null;
  if (razorpayOrderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    internalOrderId = order?.id ?? null;
  }

  let newStatus: "paid" | "failed" | "refunded" | "partially_refunded" | null = null;
  const eventType = event.event;
  if (eventType === "payment.captured" || eventType === "order.paid") {
    newStatus = "paid";
  } else if (eventType === "payment.failed") {
    newStatus = "failed";
  }

  if (newStatus && internalOrderId) {
    // Only transition from pending so a late failed event cannot downgrade a
    // payment that has already been confirmed as paid.
    await supabase
      .from("orders")
      .update({
        payment_status: newStatus,
        razorpay_payment_id:
          newStatus === "paid" && razorpayPaymentId ? razorpayPaymentId : undefined,
        status: newStatus === "paid" ? "confirmed" : newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", internalOrderId)
      .eq("payment_status", "pending");
  }

  await recordPaymentEvent({
    event_id: event.id,
    event_type: eventType,
    internal_order_id: internalOrderId ?? "",
    processing_status: "processed",
  });

  return NextResponse.json({ received: true });
}
