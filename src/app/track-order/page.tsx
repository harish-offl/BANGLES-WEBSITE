"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STATUS_ORDER: string[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  delivery_failed: "Delivery Failed",
  return_requested: "Return Requested",
  returned: "Returned",
  refund_initiated: "Refund Initiated",
  refunded: "Refunded",
};

interface OrderItem {
  product_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image: string | null;
}

interface TrackingData {
  order_number: string;
  status: string;
  payment_status: string | null;
  currency: string;
  subtotal: number;
  shipping_fee_paise: number;
  discount_paise: number;
  total_amount: number;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  tracking_number: string | null;
  courier_name: string | null;
  courier_tracking_url: string | null;
  shipping_address: string | null;
  items: OrderItem[];
  tracking_events: Array<{
    id: string;
    status: string;
    description: string | null;
    location: string | null;
    created_at: string;
  }>;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ORDER_ID_REGEX = /^BB-\d{4}-\d{4,5}$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTrackingData(null);

    const trimmed = orderNumber.trim();

    if (!trimmed) {
      setError("Please enter your Order ID.");
      return;
    }

    // Normalize: trim trailing periods/dots that may exist in stored order numbers
    const normalizedOrderNumber = trimmed.replace(/\.+$/, "");

    if (!ORDER_ID_REGEX.test(normalizedOrderNumber)) {
      setError("Invalid Order ID format. Use format like BB-2610-00001.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?order_number=${encodeURIComponent(normalizedOrderNumber)}`,
      );
      if (res.status === 404) {
        setError("Order not found. Please check your Order ID and try again.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Unable to fetch order tracking. Please try again later.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const getStatusIndex = (status: string): number =>
    STATUS_ORDER.indexOf(status);

  const currentStatusIndex = trackingData
    ? getStatusIndex(trackingData.status)
    : -1;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatPrice = (amount: number, currency: string = "INR"): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!trackingData && !error && !loading) {
    return (
      <main className="container-page py-12 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Package className="size-6 text-brand-ink" />
            <h1 className="font-display text-2xl font-semibold text-brand-ink">
              Track your order
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Your beautiful bangles are on their way. Enter your Order ID to check the latest status of your purchase.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">Order ID</Label>
              <Input
                id="order_number"
                name="order_number"
                type="text"
                placeholder="BB-2610-00001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="text-brand-ink placeholder:text-brand-ink-soft"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold bg-brand-ink text-white hover:bg-brand-c100">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  Tracking…
                </span>
              ) : (
                <>
                  Track My Order <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  if (error && !trackingData) {
    return (
      <main className="container-page py-12 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Clock className="mx-auto size-12 text-destructive mb-4" />
          <h1 className="font-display text-2xl font-semibold text-brand-ink">
            Order not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setOrderNumber("");
                setError(null);
              }}
              className="w-full sm:w-auto"
            >
              Try another ID
            </Button>
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-c100"
            >
              Browse the collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!trackingData) return null;

  const isDelivered = trackingData.status === "delivered";
  const currentEvent =
    trackingData.tracking_events[trackingData.tracking_events.length - 1];

  return (
    <main className="container-page py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Package className="size-6 text-brand-ink" />
              <h1 className="font-display text-2xl font-semibold text-brand-ink">
                Track your order
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Order #{trackingData.order_number}
            </p>
          </div>
          <Badge status={trackingData.status} />
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 mb-8">
          <StatCard label="Order date" value={formatDate(trackingData.created_at)} />
          <StatCard
            label="Order status"
            value={STATUS_LABELS[trackingData.status] ?? trackingData.status}
          />
          <StatCard
            label="Payment status"
            value={
              (trackingData.payment_status ?? "pending")
                .charAt(0)
                .toUpperCase() + (trackingData.payment_status ?? "pending").slice(1)
            }
          />
          <StatCard
            label="Total amount"
            value={formatPrice(trackingData.total_amount, trackingData.currency)}
          />
        </div>

        {/* Delivery address */}
        {trackingData.shipping_address && (
          <div className="mb-8 rounded-lg border border-border bg-brand-c100 p-4">
            <div className="flex items-start gap-3">
              <Truck className="size-5 text-brand-ink shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-brand-ink">
                  Delivery address
                </h3>
                <p className="text-xs text-dev-muted">
                  {trackingData.shipping_address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courier information */}
        {trackingData.tracking_number ? (
          <div className="mb-8 rounded-lg border border-border bg-brand-c100 p-4">
            <div className="flex items-start gap-3">
              <Truck className="size-5 text-brand-ink shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-brand-ink">
                  Courier tracking
                </h3>
                <p className="text-xs text-dev-muted">
                  {trackingData.courier_name}
                </p>
                <p className="text-xs text-dev-muted">
                  {trackingData.tracking_number}
                </p>
                {trackingData.courier_tracking_url && (
                  <a
                    href={trackingData.courier_tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-brand-ink underline underline-offset-4"
                  >
                    Track on courier website{" "}
                    <ArrowRight className="size-3.5" />
                  </a>
                )}
                {trackingData.estimated_delivery && (
                  <p className="mt-1 text-xs text-dev-muted">
                    Estimated delivery:{" "}
                    {formatDate(trackingData.estimated_delivery)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-border bg-brand-c100 p-4">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-muted-foreground shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-brand-ink">
                  Courier tracking
                </h3>
                <p className="text-xs text-dev-muted">
                  Your order is being prepared. Courier details will be available once your order is shipped.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <h3 className="text-sm font-semibold text-brand-ink tracking-tight uppercase mb-3">
          Items in your order
        </h3>
        <div className="grid gap-3 mb-8">
          {trackingData.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 border-b border-border pb-3 last:border-0">
              <div className="relative size-12 shrink-0">
                <img
                  src={item.product_image || "/images/brand/logo.png"}
                  alt={item.product_name}
                  className="size-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-brand-ink truncate">
                    {item.product_name}
                  </span>
                  {item.variant && (
                    <span className="text-xs text-muted-foreground">
                      {item.variant}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity}
                </p>
                <p className="text-xs font-medium text-brand-ink">
                  {formatPrice(item.line_total, trackingData.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tracking timeline */}
        <h3 className="text-sm font-semibold text-brand-ink tracking-tight uppercase mb-4">
          Tracking timeline
        </h3>
        <div className="relative mb-8">
          <div className="absolute left-[14px] top-8 bottom-[20px] w-[2px] bg-border" />

          {trackingData.tracking_events.map((event, idx) => {
            const isCompleted =
              getStatusIndex(event.status) <= currentStatusIndex;
            const isCurrent =
              getStatusIndex(event.status) === currentStatusIndex;
            const isLast = idx === trackingData.tracking_events.length - 1;

            return (
              <div key={event.id} className="relative pl-14 pb-6 last:pb-0">
                {!isLast && (
                  <div className="absolute left-[13px] top-[34px] bottom-[2px] w-[2px] bg-border" />
                )}
                <div className="absolute left-[10px] top-[28px] z-10">
                  <div
                    className={cn(
                      "size-6 rounded-full border-2 flex items-center justify-center",
                      isCompleted
                        ? "border-brand-ink bg-brand-ink"
                        : "border-border bg-white",
                    )}
                  >
                    {isCompleted && (
                      <CheckCircle2 className="size-2.5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isCompleted
                          ? "text-brand-ink"
                          : "text-muted-foreground",
                      )}
                    >
                      {STATUS_LABELS[event.status] ?? event.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.created_at)}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-xs text-muted-foreground">
                      {event.location}
                    </p>
                  )}
                  <p className="text-sm text-dev-muted">
                    {event.description}
                  </p>
                </div>
              </div>
            )}
          )}
        </div>

        {/* Support */}
        <div className="mt-8 rounded-lg border border-border bg-brand-c100 p-6">
          <h3 className="text-sm font-semibold text-brand-ink mb-4">
            Need help?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/contact"
              className="w-full inline-flex items-center justify-center rounded-lg border border-brand-c300/70 bg-brand-white px-4 py-3 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-c100"
            >
              Contact Support
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}`}
              className="w-full inline-flex items-center justify-center rounded-lg border border-brand-c300/70 bg-brand-white px-4 py-3 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-c100"
            >
              <Mail className="size-4 mr-2" /> Chat on WhatsApp
            </a>
            <a
              href="/shop"
              className="w-full inline-flex items-center justify-center rounded-lg border border-border bg-brand-white px-4 py-3 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-c100"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Badge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const isDelivered = status === "delivered";
  const isCancelled =
    status === "cancelled" || status === "delivery_failed";
  const isPending = ["pending", "confirmed"].includes(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        isDelivered
          ? "bg-green-100 text-green-800 border border-green-200"
          : isCancelled
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : isPending
          ? "bg-brand-c100 text-brand-ink border border-brand-c300"
          : "bg-brand-c100 text-brand-ink border border-brand-c300",
      )}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-brand-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-brand-ink">{value}</p>
    </div>
  );
}
