import { NextResponse } from "next/server";

import { createAuthClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/lib/orders/queries";

/**
 * GET /api/customer/orders
 *
 * Returns the orders belonging to the currently authenticated customer.
 * Requires authentication — unauthenticated callers receive 401.
 */
export async function GET() {
  try {
    const supabase = await createAuthClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication is not configured for this deployment." },
        { status: 500 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const orders = await getCustomerOrders();
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Customer orders fetch error:", err);
    return NextResponse.json(
      { error: "Unable to fetch orders. Please try again later." },
      { status: 500 },
    );
  }
}