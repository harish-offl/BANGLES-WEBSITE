import "server-only";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { Order } from "@/types";

export async function updateOrderPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: "paid" | "failed" | "refunded" | "partially_refunded";
}): Promise<Order | null> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      razorpay_payment_id: input.razorpay_payment_id,
      payment_status: input.status,
      status: input.status === "paid" ? "confirmed" : input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_order_id", input.razorpay_order_id)
    .eq("payment_status", "pending") // idempotent: only transition from pending
    .select("*, items:order_items(*)")
    .single();
  if (error) return null;
  return data as Order;
}

export async function recordPaymentEvent(input: {
  event_id: string;
  event_type: string;
  internal_order_id: string;
  processing_status: "pending" | "processed" | "ignored";
}): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("payment_events").insert({
    event_id: input.event_id,
    provider: "razorpay",
    event_type: input.event_type,
    internal_order_id: input.internal_order_id,
    processing_status: input.processing_status,
    processed_at: input.processing_status === "processed" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
}
