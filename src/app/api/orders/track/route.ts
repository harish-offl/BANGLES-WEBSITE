import { NextResponse } from "next/server";

import { createAuthClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/track?order_number=BB-2610-00001
 *
 * Returns safe tracking information for a given order number.
 *
 * Security:
 * - Does NOT expose customer email, phone, full address or payment details.
 * - Returns only order number, status, items (names/qty/prices), and
 *   tracking-related fields that are safe for public lookup.
 * - No auth required (public lookup by order number).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = (searchParams.get("order_number") || "").trim();

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Order ID is required." },
      { status: 400 },
    );
  }

  // Validate order ID format: BB-YYMM-NNNNN
  const orderIdRegex = /^BB-\d{4}-\d{5}$/;
  if (!orderIdRegex.test(orderNumber)) {
    return NextResponse.json(
      { error: "Invalid Order ID format. Use format like BB-2610-00001." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createAuthClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication is not configured for this deployment." },
        { status: 500 },
      );
    }
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        subtotal,
        shipping_fee_paise,
        discount_paise,
        total_amount,
        currency,
        shipping_address,
        customer_state,
        tracking_number,
        courier_name,
        courier_tracking_url,
        estimated_delivery,
        shipped_at,
        delivered_at,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name_snapshot,
          selected_variant_snapshot,
          quantity,
          unit_price,
          line_total,
          products (
            id,
            name,
            primary_image_url
          )
        )
        `
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }

    // Fetch tracking events for this order
    const { data: trackingEvents } = await supabase
      .from("order_tracking_events")
      .select("id, status, description, location, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    // Build safe response (no customer email, phone, full address)
    const trackingData = {
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      currency: order.currency,
      subtotal: order.subtotal,
      shipping_fee_paise: order.shipping_fee_paise,
      discount_paise: order.discount_paise,
      total_amount: order.total_amount,
      estimated_delivery: order.estimated_delivery,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      created_at: order.created_at,
      tracking_number: order.tracking_number,
      courier_name: order.courier_name,
      courier_tracking_url: order.courier_tracking_url,
      shipping_address: order.shipping_address ? "Available" : null, // Only show presence, not full address
      items: (order.order_items || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name_snapshot,
        variant: item.selected_variant_snapshot,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        product_image: (item.products as { primary_image_url: string | null })?.primary_image_url ?? null,
        product_name_public: (item.products as { name: string | null })?.name ?? item.product_name_snapshot,
      })),
      tracking_events: (trackingEvents || []).map((event: Record<string, unknown>) => ({
        id: event.id,
        status: event.status,
        description: event.description,
        location: event.location,
        created_at: event.created_at,
      })),
    };

    return NextResponse.json(trackingData);
  } catch (err) {
    console.error("Order tracking error:", err);
    return NextResponse.json(
      { error: "Unable to fetch order tracking. Please try again later." },
      { status: 500 },
    );
  }
}
