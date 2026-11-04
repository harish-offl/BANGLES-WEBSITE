import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderStatusUpdateDialog } from "@/components/admin/order-status-update-dialog";
import { EnquiryDetailModal } from "@/components/admin/enquiry-detail-modal";
import { WhatsAppOrderButton } from "@/components/admin/whatsapp-order-button";
import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminOrderOverview, getAllOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/site";
import { DELIVERY_STAGE_LABELS } from "@/lib/orders/lifecycle";

export const metadata: Metadata = { title: "Order Management" };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function deliveryStageBadgeClass(deliveryStage: string): string {
  switch (deliveryStage) {
    case "delivered":
      return "bg-success/10 text-success border border-success/20";
    case "out_for_delivery":
      return "bg-brand-c200 text-brand-ink border border-brand-c300";
    case "shipped":
      return "bg-brand-c100 text-brand-ink border border-brand-c300";
    case "packing":
      return "bg-warning/10 text-warning-foreground border border-warning/20";
    case "order_confirmed":
      return "bg-brand-c100 text-brand-ink border border-brand-c300";
    default:
      return "bg-brand-c100 text-brand-ink border border-brand-c300";
  }
}

export default async function AdminOrdersPage() {
  const [orders, overview] = await Promise.all([
    getAllOrders(),
    getAdminOrderOverview(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Order Management"
        description={`${overview.total} orders recorded from the storefront bag.`}
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total orders" value={overview.total} />
        <StatCard label="Order Confirmed" value={overview.order_confirmed} />
        <StatCard label="Packing" value={overview.packing} />
        <StatCard label="Shipped" value={overview.shipped} />
        <StatCard label="Out for Delivery" value={overview.outForDelivery} />
        <StatCard label="Delivered" value={overview.delivered} />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<span className="size-5 text-muted-foreground">🛍️</span>}
          title="No orders yet"
          description="When a customer places an order, it will appear here so you can manage the full lifecycle."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium tabular-nums">S.No</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Delivery Stage</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className="border-b border-border last:border-0 group">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-foreground font-medium">{order.order_number}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customer_name ?? "—"}
                    {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground font-medium">
                    {formatPrice(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        deliveryStageBadgeClass(order.delivery_stage ?? ""),
                      )}
                    >
                      {DELIVERY_STAGE_LABELS[order.delivery_stage ?? ""] ?? order.delivery_stage ?? "Not Started"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <OrderStatusUpdateDialog
                        order={order}
                        trigger={
                          <Button variant="outline" size="sm" className="h-8">
                            Update status
                          </Button>
                        }
                      />
                      <EnquiryDetailModal order={order} />
                      <WhatsAppOrderButton order={order} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}