import type { Metadata } from "next";

import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { ListingPagination } from "@/components/shop/listing-pagination";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { getCatalog } from "@/lib/data";
import { allowedTransitions, ORDER_STATUS_LABELS } from "@/lib/orders/lifecycle";
import { formatPrice } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Order Management" };

const PAGE_SIZE = 25;

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const catalog = getCatalog();
  const [result, counts] = await Promise.all([
    catalog.listOrdersPage({ page, pageSize: PAGE_SIZE }),
    catalog.getOrderStatusCounts(),
  ]);
  const orders = result.items;

  const totalOrders = (Object.values(counts) as number[]).reduce(
    (sum, value) => sum + value,
    0,
  );
  const pendingOrders = (counts.pending ?? 0) + (counts.confirmed ?? 0);
  const shippedOrders = counts.shipped ?? 0;
  const deliveredOrders = counts.delivered ?? 0;
  const cancelledOrders = counts.cancelled ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Order Management"
        description={`Manage orders and update shipping status. ${totalOrders} order${totalOrders === 1 ? "" : "s"} on record.`}
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : null}
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
                    <OrderStatusForm orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ListingPagination
          page={result.page}
          pageCount={result.pageCount}
          basePath="/admin/orders"
          baseParams=""
        />
      </div>
    </div>
  );
}

function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const nextStatuses = allowedTransitions(status);

  if (nextStatuses.length === 0) {
    return <span className="text-xs text-muted-foreground">No actions</span>;
  }

  return (
    <form action={updateOrderStatusAction} className="flex items-center justify-end gap-2">
      <input type="hidden" name="id" value={orderId} />
      <label className="sr-only" htmlFor={`status-${orderId}`}>
        Update order status
      </label>
      <select
        id={`status-${orderId}`}
        name="status"
        defaultValue={nextStatuses[0]}
        className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
      >
        {nextStatuses.map((next) => (
          <option key={next} value={next}>
            {ORDER_STATUS_LABELS[next] ?? next}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm" className="h-8">
        Update
      </Button>
    </form>
  );
}
