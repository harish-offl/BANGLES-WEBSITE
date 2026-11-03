import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/lifecycle";

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

export function OrderSummaryCard({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-base font-semibold text-foreground">
        Order summary
      </h3>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Order ID</dt>
          <dd className="font-medium text-foreground">#{order.order_number}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Placed</dt>
          <dd className="text-foreground">{formatDate(order.created_at)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={statusVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">
            {formatCurrency(order.subtotal, order.currency)}
          </dd>
        </div>
        {typeof order.shipping_fee === "number" && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-foreground">
              {order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee, order.currency)}
            </dd>
          </div>
        )}
        {typeof order.discount === "number" && order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="text-foreground">
              -{formatCurrency(order.discount, order.currency)}
            </dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="font-semibold text-foreground">
            {formatCurrency(order.total_amount, order.currency)}
          </dd>
        </div>
      </dl>

      {order.shipping_address && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-xs font-medium text-muted-foreground">Delivery address</h4>
          <p className="mt-1 text-sm text-foreground">
            {order.shipping_address}
          </p>
        </div>
      )}

      {order.courier_name && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-xs font-medium text-muted-foreground">Courier</h4>
          <p className="mt-1 text-sm text-foreground">
            {order.courier_name}
            {order.tracking_number ? ` · ${order.tracking_number}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}