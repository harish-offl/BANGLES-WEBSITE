"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { updateOrderStatusAction } from "@/app/admin/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  delivery_failed: "Delivery Failed",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
  refund_initiated: "Refund Initiated",
  refunded: "Refunded",
  payment_pending: "Payment Pending",
  payment_failed: "Payment Failed",
  stock_unavailable: "Stock Unavailable",
  returned: "Returned",
};

const STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

interface EnquiryStatusSelectProps {
  id: string;
  status: OrderStatus;
}

export function EnquiryStatusSelect({ id, status }: EnquiryStatusSelectProps) {
  const [pending, startTransition] = useTransition();

  function handleChange(next: OrderStatus) {
    if (next === status) return;
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", next);
    startTransition(() => {
      void updateOrderStatusAction(formData);
    });
  }

  return (
    <Select value={status} onValueChange={(value) => handleChange(value as OrderStatus)}>
      <SelectTrigger size="sm" disabled={pending} aria-label="Enquiry status">
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
