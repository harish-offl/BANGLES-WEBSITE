"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { updateOrderLifecycleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/orders/lifecycle";

interface OrderStatusUpdateDialogProps {
  order: Order;
  trigger: React.ReactElement;
}

const DELIVERY_STAGES: Array<{
  value: string;
  label: string;
}> = [
  { value: "", label: "Not Started" },
  { value: "order_confirmed", label: "Order Confirmed" },
  { value: "packing", label: "Packing" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

export function OrderStatusUpdateDialog({
  order,
  trigger,
}: OrderStatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateOrderLifecycleAction,
    { status: "idle" },
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      setOpen(false);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              Order #{order.order_number}
            </p>
            <p className="text-xs text-muted-foreground">
              Current Status:{" "}
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="orderId" value={order.id} />

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">
              Order Tracking Details
            </h3>

            <div className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryStage">Delivery Stage</Label>
                <Select
                  name="deliveryStage"
                  defaultValue={order.delivery_stage ?? ""}
                >
                  <SelectTrigger id="deliveryStage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="courierPartner">Courier Partner</Label>
                <Input
                  id="courierPartner"
                  name="courierPartner"
                  defaultValue={order.courier_partner ?? ""}
                  placeholder="e.g. India Post, Delhivery, Blue Dart"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input
                  id="trackingId"
                  name="trackingId"
                  defaultValue={order.tracking_id ?? order.tracking_number ?? ""}
                  placeholder="e.g. IN123456789"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update status"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
