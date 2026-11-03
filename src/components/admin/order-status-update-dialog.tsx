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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";
import {
  ORDER_STATUS_LABELS,
  allowedTransitions,
} from "@/lib/orders/lifecycle";

interface OrderStatusUpdateDialogProps {
  order: Order;
  trigger: React.ReactElement;
}

export function OrderStatusUpdateDialog({
  order,
  trigger,
}: OrderStatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateOrderLifecycleAction,
    { status: "idle" },
  );

  const allowed = allowedTransitions(order.status);

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
          <DialogDescription>
            Order #{order.order_number} · current status:{" "}
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="orderId" value={order.id} />

          <div className="grid gap-2">
            <Label htmlFor="newStatus">New status</Label>
            <Select name="newStatus" defaultValue={order.status} disabled>
              <SelectTrigger id="newStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_LABELS[status] ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allowed.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No further status transitions are permitted from{" "}
                {ORDER_STATUS_LABELS[order.status] ?? order.status}.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customerMessage">Customer-facing message (optional)</Label>
            <Textarea
              id="customerMessage"
              name="customerMessage"
              placeholder="Leave blank to use the default message for this status."
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="internalNote">Internal admin note (optional)</Label>
            <Textarea
              id="internalNote"
              name="internalNote"
              placeholder="Visible only to the admin team."
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courierName">Courier partner (optional)</Label>
            <Input id="courierName" name="courierName" defaultValue={order.courier_name ?? ""} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trackingNumber">Tracking number (optional)</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              defaultValue={order.tracking_number ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trackingUrl">Tracking URL (optional)</Label>
            <Input
              id="trackingUrl"
              name="trackingUrl"
              type="url"
              defaultValue={order.courier_tracking_url ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estimatedDelivery">Estimated delivery (optional)</Label>
            <Input
              id="estimatedDelivery"
              name="estimatedDelivery"
              type="datetime-local"
              defaultValue={
                order.estimated_delivery
                  ? new Date(order.estimated_delivery).toISOString().slice(0, 16)
                  : ""
              }
            />
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
            <Button type="submit" disabled={isPending || allowed.length === 0}>
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