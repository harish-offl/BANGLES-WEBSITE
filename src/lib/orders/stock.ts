import "server-only";

import { getServiceRoleClient } from "@/lib/supabase/service-role";

export interface StockDecrementResult {
  ok: boolean;
  message: string | null;
}

/**
 * Atomically decrements inventory for a paid order.
 *
 * The database function claims the order via `stock_deducted_at`, so the
 * checkout callback and the Razorpay webhook can both call this safely; only
 * the first call changes stock. If a colour/size has too little stock the
 * payment is kept (the customer has already paid) and the order is flagged
 * `stock_unavailable` for the team to resolve.
 */
export async function decrementOrderStock(
  orderId: string,
): Promise<StockDecrementResult> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.rpc("decrement_order_stock", {
    p_order_id: orderId,
  });

  if (!error) return { ok: true, message: null };

  const message = error.message || "Stock could not be updated.";
  console.error(`Stock decrement failed for order ${orderId}: ${message}`);

  const { error: flagError } = await supabase
    .from("orders")
    .update({
      status: "stock_unavailable",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .in("status", ["pending", "confirmed", "processing"]);

  if (flagError) {
    console.error(
      `Could not flag order ${orderId} as stock_unavailable: ${flagError.message}`,
    );
  }

  return { ok: false, message };
}
