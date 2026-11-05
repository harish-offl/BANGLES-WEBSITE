"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Subscribes the authenticated customer to realtime updates on their own
 * orders. The callback fires whenever an order they own changes (status,
 * courier, timestamps, etc.) so the customer dashboard can refresh without
 * a manual page reload.
 *
 * The subscription is scoped to the caller's `customer_id` column, so a
 * customer can never receive another customer's order events.
 */
export function useCustomerOrderRealtime(
  customerId: string | null,
  onChange: () => void,
): void {
  const callbackRef = useRef(onChange);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  const [client] = useState(() => {
    try {
      return createBrowserSupabaseClient();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!client || !customerId) return;

    const channel = client.channel(`customer-orders:${customerId}`);
    const handler = (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
      // Only react to changes on the caller's own orders.
      if (payload.new && (payload.new as { customer_id: string }).customer_id === customerId) {
        callbackRef.current();
      }
    };

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `customer_id=eq.${customerId}`,
      },
      handler,
    );

    channel.subscribe((status: string) => {
      if (status !== "SUBSCRIBED") {
        // Non-fatal: the manual refresh fallback remains available.
        console.warn("[realtime] order subscription status:", status);
      }
    });

    return () => {
      client.removeChannel(channel);
    };
  }, [client, customerId]);
}