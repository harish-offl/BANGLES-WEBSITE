import Link from "next/link";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { getCustomerOrders } from "@/lib/orders/queries";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const orders = await getCustomerOrders();
  const active = orders.filter(
    (o) =>
      !["delivered", "cancelled", "refunded", "returned"].includes(o.status),
  );
  const delivered = orders.filter((o) => o.status === "delivered");
  const cancelled = orders.filter((o) =>
    ["cancelled", "refunded", "returned"].includes(o.status),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          My account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {identity.fullName ?? "valued customer"}. Track your
          orders and manage your account from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total orders</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground tabular-nums">
            {orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Active orders</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground tabular-nums">
            {active.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground tabular-nums">
            {delivered.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-gold-strong hover:underline"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              You have not placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-flex items-center rounded-lg border border-border bg-brand-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const firstItem = order.items?.[0];
  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="flex items-center gap-4 rounded-lg border border-border bg-brand-white p-4 transition-colors hover:border-brand-c300"
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-brand-c100">
        {firstItem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/brand/logo.png"
            alt={firstItem.product_name_snapshot}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          #{order.order_number}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {firstItem?.product_name_snapshot ?? "Order"} ·{" "}
          {firstItem?.quantity ?? 0} item
          {firstItem?.quantity === 1 ? "" : "s"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: order.currency,
            minimumFractionDigits: 0,
          }).format(order.total_amount)}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{order.status.replace(/_/g, " ")}</p>
      </div>
    </Link>
  );
}