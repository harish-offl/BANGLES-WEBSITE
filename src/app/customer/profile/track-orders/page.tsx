"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { OrderSummaryCard } from "@/components/account/order-summary-card";
import type { Order, OrderItem, OrderStatus } from "@/types";

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  courier_tracking_url: string | null;
  customer_message: string | null;
  internal_note: string | null;
  items: Array<{
    product_name_snapshot: string;
    product_image_url: string | null;
    quantity: number;
    unit_price: number;
  }>;
}

export default function TrackOrdersPage() {
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [result, setResult] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/customer/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setError("Unable to load orders. Please try again later.");
        return;
      }
      const data = await res.json();
      setOrders(data || []);
    } catch {
      setError("Unable to load orders. Please try again later.");
    } finally {
      setOrdersLoaded(true);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Please enter an Order ID or Tracking ID.");
      setResult(null);
      return;
    }

    // Load orders if not already loaded
    if (!ordersLoaded) {
      await loadOrders();
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Find the order matching the entered ID (by order_number or id)
    const trimmed = orderId.trim().toUpperCase();
    const found = orders.find(
      (o) =>
        o.order_number?.toUpperCase() === trimmed ||
        o.id?.toUpperCase() === trimmed ||
        o.tracking_number?.toUpperCase() === trimmed,
    );

    if (!found) {
      setError("No order found. Please check your Order ID.");
      setResult(null);
      setLoading(false);
      return;
    }

    setResult(found);
    setLoading(false);
  };

  const handleClear = () => {
    setOrderId("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Track Your Order
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your Order ID or Tracking ID to check the status of your shipment.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order_id">Order ID / Tracking ID</Label>
            <Input
              id="order_id"
              placeholder="e.g. ORD-10025"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !ordersLoaded} className="flex-1">
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              Track Order
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={loading || !ordersLoaded || (!orderId && !result && !error)}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex">
            <AlertCircle className="size-5 text-destructive" />
            <p className="ml-3 text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Order #{result.order_number}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Order placed on{" "}
                {new Date(result.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <Link
              href="/customer/profile"
              className="text-sm font-medium text-gold-strong hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrackingTimeline
                order={{
                  id: result.id,
                  order_number: result.order_number,
                  status: result.status as OrderStatus,
                  tracking_number: result.tracking_number,
                  courier_name: result.courier_name,
                  courier_tracking_url: result.courier_tracking_url,
                  estimated_delivery: result.estimated_delivery,
                  created_at: result.created_at,
                  updated_at: result.updated_at,
                } as Order}
                history={[
                  {
                    id: "1",
                    order_id: result.id,
                    previous_status: null,
                    new_status: result.status as OrderStatus,
                    customer_message: result.customer_message,
                    internal_note: result.internal_note,
                    courier_name: result.courier_name,
                    tracking_number: result.tracking_number,
                    tracking_url: result.courier_tracking_url,
                    estimated_delivery: result.estimated_delivery,
                    updated_by: null,
                    created_at: result.created_at,
                  },
                ]}
              />
            </div>
            <div className="space-y-4">
              <OrderSummaryCard
                order={{
                  id: result.id,
                  order_number: result.order_number,
                  status: result.status as OrderStatus,
                  subtotal: result.items.reduce(
                    (sum, item) => sum + item.unit_price * item.quantity,
                    0,
                  ),
                  total_amount: result.total_amount,
                  currency: result.currency,
                  shipping_fee: 0,
                  discount: 0,
                  items: result.items.map((item) => ({
                    id: `${result.id}-${item.product_name_snapshot}`,
                    order_id: result.id,
                    product_id: "",
                    product_name_snapshot: item.product_name_snapshot,
                    selected_variant_snapshot: null,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    line_total: item.unit_price * item.quantity,
                  })) as OrderItem[],
                  created_at: result.created_at,
                  estimated_delivery: result.estimated_delivery,
                  courier_name: result.courier_name,
                  tracking_number: result.tracking_number,
                  shipping_address: "",
                } as Order}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
