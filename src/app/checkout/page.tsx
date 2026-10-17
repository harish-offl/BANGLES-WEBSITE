"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/site";
import { useCartLines } from "@/hooks/use-cart";

interface CheckoutLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  size: string | null;
  colour: string | null;
  unitPrice: number;
  name: string;
}

interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  orderNumber: string;
  internalOrderId: string;
}

export default function CheckoutPage() {
  const lines = useCartLines();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingFee = subtotal >= 2499 ? 0 : 40;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (lines.length === 0 && typeof window !== "undefined") {
      window.location.href = "/cart";
    }
  }, [lines]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(Boolean((window as any).Razorpay));
    script.onerror = () => setError("Payment provider could not load.");
    document.head.appendChild(script);
    return () => {
      try {
        document.head.removeChild(script);
      } catch {}
    };
  }, []);

  async function createOrder() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            size: l.size,
            colour: l.colour,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
        }),
      });
      const data = (await res.json()) as CreateOrderResponse & { error?: string };
      if (!res.ok || !data.razorpayOrderId) {
        throw new Error(data.error || "Could not create order.");
      }
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  }

  function openCheckout() {
    if (!order || !order.keyId || !razorpayReady) return;
    const options: any = {
      key: order.keyId,
      amount: Math.round(total * 100),
      currency: "INR",
      name: "Bangles by Beauty",
      description: `Order ${order.orderNumber}`,
      image: "/images/brand/logo.png",
      order_id: order.razorpayOrderId,
      prefill: {
        name: form.name || "",
        email: form.email || "",
        contact: form.phone || "",
      },
      theme: { color: "#F0ADA2" },
      modal: {
        ondismiss: () => {
          toast.warning("Payment was cancelled. Your order is still pending.");
        },
      },
      handler: async (response: any) => {
        await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  async function verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      if (typeof window !== "undefined") {
        window.location.href = `/order-success/${data.orderId}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment verification failed.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) return null;

  return (
    <main className="container-page py-12">
      <h1 className="font-display text-2xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Review your bag and complete secure payment.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="space-y-5">
          <h2 className="font-display text-lg">Delivery details</h2>
          <form onSubmit={(e) => { e.preventDefault(); void createOrder(); }}>
            <div className="space-y-3">
              <label htmlFor="name" className="block text-xs font-medium text-muted-foreground">
                Full name
              </label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <label htmlFor="phone" className="block text-xs font-medium text-muted-foreground">
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                required
                maxLength={15}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <label htmlFor="address" className="block text-xs font-medium text-muted-foreground">
                Delivery address
              </label>
              <Input
                id="address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House, street, city, pincode"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !form.name || !form.email || !form.phone || !form.address}
              className="w-full h-11 text-base"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating order…
                </span>
              ) : (
                "Create order"
              )}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{lines.reduce((s, l) => s + l.quantity, 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="font-medium">Total</dt>
              <dd className="font-medium">{formatPrice(total)}</dd>
            </div>
          </dl>
          {order && razorpayReady && !submitting ? (
            <Button
              onClick={openCheckout}
              className="w-full h-11 text-base bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Pay ₹{total.toFixed(2)} Securely
            </Button>
          ) : order && !razorpayReady ? (
            <p className="text-xs text-muted-foreground">Loading payment provider…</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
