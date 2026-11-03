"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { formatPrice } from "@/lib/site";

interface EnquiryDetailModalProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    customer_name: string | null;
    customer_phone: string | null;
    shipping_address: string | null;
    customer_state: string | null;
    total_amount: number;
    currency: string;
    created_at: string;
    notes: string | null;
    items?: Array<{
      product_name_snapshot: string;
      quantity: number;
      unit_price: number | null;
    }>;
  };
}

export function EnquiryDetailModal({ order }: EnquiryDetailModalProps) {
  const items = order.items ?? [];
  const totalQuantity = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0 gap-0" aria-label="View enquiry details">
            <Info className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enquiry Details</DialogTitle>
          <DialogDescription>{order.order_number}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="text-foreground font-medium">{order.order_number}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="text-foreground capitalize">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Customer</dt>
            <dd className="text-foreground">
              {order.customer_name ?? "—"}
              {order.customer_phone ? ` · ${order.customer_phone}` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">State</dt>
            <dd className="text-foreground capitalize">{order.customer_state ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Delivery address</dt>
            <dd className="text-foreground max-w-xs truncate">
              {order.shipping_address ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="tabular-nums text-foreground font-medium">
              {formatPrice(order.total_amount, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-muted-foreground">
              {new Date(order.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Items</dt>
            <dd className="text-foreground">
              {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
            </dd>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Items</h3>
            <div className="grid gap-3">
              {items.map((item: { product_name_snapshot: string; quantity: number; unit_price: number | null }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 border-b border-border pb-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.product_name_snapshot}
                  </span>
                  <span className="text-sm tabular-nums text-foreground">
                    {item.quantity} × {formatPrice(item.unit_price ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Note</h3>
            <p className="text-sm text-foreground">{order.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
