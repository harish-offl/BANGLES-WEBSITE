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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
          <input type="hidden" name="previousStatus" value={order.status} />

          <div className="grid gap-2">
            <Label htmlFor="newStatus">New Order Status</Label>
            <Select
              name="newStatus"
              defaultValue={order.status}
              disabled={allowed.length === 0}
            >
              <SelectTrigger id="newStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_LABELS[status] ?? status}
                  </SelectItem>
                ))}
                {allowed.length === 0 && (
                  <SelectItem disabled value={order.status}>
                    No further transitions
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
