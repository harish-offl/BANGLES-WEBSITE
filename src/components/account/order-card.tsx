import Link from "next/link";
import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";
import {
  ORDER_STATUS_LABELS,
  timelineIndex,
} from "@/lib/orders/lifecycle";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusVariant(status: string) {
  switch (status) {
    case "delivered":
      return "success";
    case "cancelled":
    case "delivery_failed":
    case "payment_failed":
      return "destructive";
    case "out_for_delivery":
      return "warning";
    default:
      return "secondary";
  }
}

export function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items?.[0];
  const isDelivered = order.status === "delivered";
  const isCancelled = ["cancelled", "refunded", "returned"].includes(order.status);

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand-c300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-brand-c100 text-brand-ink">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              #{order.order_number}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {firstItem?.product_name_snapshot ?? "Order"} ·{" "}
              {firstItem?.quantity ?? 0} item
              {firstItem?.quantity === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Placed</p>
            <p className="text-foreground">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-medium text-foreground">
              {formatCurrency(order.total_amount, order.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={statusVariant(order.status)} className="mt-0.5">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
          {order.estimated_delivery && (
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-foreground">
                {formatDate(order.estimated_delivery)}
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Link href={`/account/orders/${order.id}`} className="sm:hidden">
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Link href={`/account/orders/${order.id}`} className="hidden sm:block">
            <Button variant="outline" size="sm">
              View details
            </Button>
          </Link>
          {!isDelivered && !isCancelled && (
            <Link href={`/track-order?order_number=${order.order_number}`}>
              <Button size="sm">Track order</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}