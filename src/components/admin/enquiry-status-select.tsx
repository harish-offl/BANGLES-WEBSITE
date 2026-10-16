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
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
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
