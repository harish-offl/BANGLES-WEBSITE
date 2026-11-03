import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { OrderSummaryCard } from "@/components/account/order-summary-card";
import { getCustomerOrderById, getCustomerOrderHistory } from "@/lib/orders/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderTrackPage({ params }: PageProps) {
  const { orderId } = await params;
  const [order, history] = await Promise.all([
    getCustomerOrderById(orderId),
    getCustomerOrderHistory(orderId),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Track Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order #{order.order_number}
          </p>
        </div>
        <Link href={`/track-order?order_number=${order.order_number}`}>
          <Button variant="outline" size="sm">
            Open tracking page
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrackingTimeline order={order} history={history} />
        </div>
        <div className="space-y-4">
          <OrderSummaryCard order={order} />
        </div>
      </div>
    </div>
  );
}
