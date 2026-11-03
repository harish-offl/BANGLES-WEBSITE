"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/account/order-card";
import { useCustomerOrderRealtime } from "@/hooks/use-customer-order-realtime";
import type { Order } from "@/types";

interface CustomerOrdersListProps {
  initialOrders: Order[];
  customerId: string | null;
}

export function CustomerOrdersList({
  initialOrders,
  customerId,
}: CustomerOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/customer/orders", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as Order[];
        setOrders(data);
      }
    } catch {
      // Keep the existing list on failure.
    } finally {
      setRefreshing(false);
    }
  }

  useCustomerOrderRealtime(customerId, () => {
    void refresh();
  });

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          You have not placed any orders yet.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center rounded-lg border border-border bg-brand-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>
      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}