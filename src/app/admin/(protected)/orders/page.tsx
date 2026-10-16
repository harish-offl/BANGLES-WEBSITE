import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { EnquiryStatusSelect } from "@/components/admin/enquiry-status-select";
import { AdminPageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { getAllOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/site";
import type { Order, OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Enquiries" };

interface EnquiriesPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> =
  {
    pending: "secondary",
    confirmed: "default",
    processing: "default",
    dispatched: "default",
    delivered: "default",
    cancelled: "destructive",
  };

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

function itemSummary(order: Order): string {
  const items = order.items ?? [];
  if (items.length === 0) return "—";
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const names = items.map((item) => item.product_name_snapshot).join(", ");
  return `${totalQuantity} item${totalQuantity === 1 ? "" : "s"} · ${names}`;
}

export default async function AdminEnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const params = await searchParams;
  const orders = await getAllOrders();

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description={`${orders.length} enquir${orders.length === 1 ? "y" : "ies"} recorded from the storefront bag.`}
      />

      {params.saved ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-foreground"
        >
          Enquiry updated.
        </p>
      ) : null}
      {params.error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          Could not update the enquiry. Please try again.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-5" aria-hidden="true" />}
          title="No enquiries yet"
          description="When a customer sends their bag to WhatsApp, the enquiry is recorded here so you can follow up."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg text-foreground">
                      {order.order_number}
                    </h2>
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <EnquiryStatusSelect id={order.id} status={order.status} />
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="text-foreground">
                    {order.customer_name ?? "—"}
                    {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="tabular-nums text-foreground">
                    {formatPrice(order.total_amount, order.currency)}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-sm text-muted-foreground">{itemSummary(order)}</p>

              {order.notes ? (
                <p className="mt-3 rounded-lg border border-border bg-brand-smoke/50 px-3 py-2 text-sm text-foreground">
                  <span className="text-muted-foreground">Note: </span>
                  {order.notes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
