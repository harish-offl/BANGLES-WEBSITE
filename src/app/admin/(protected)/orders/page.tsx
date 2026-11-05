import type { Metadata } from "next";

import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/data";
import { formatPrice } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Management" };

export default async function AdminOrdersPage() {
  const catalog = getCatalog();
  const [orders] = await Promise.all([catalog.listOrders()]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        description={`Manage orders and update shipping status. ${orders.length} order${orders.length === 1 ? "" : "s"} on record.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="New Orders" value={pendingOrders} />
        <StatCard label="Shipped" value={shippedOrders} />
        <StatCard label="Delivered" value={deliveredOrders} />
        <StatCard label="Cancelled" value={cancelledOrders} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg">Order Management</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium tabular-nums">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customer_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-right font-medium">
                    {formatPrice(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : order.status === "cancelled"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-brand-c100 text-brand-ink border border-brand-c300",
                      )}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      className="h-8"
                    >
                      Update status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}