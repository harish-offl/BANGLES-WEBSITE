import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Order, OrderStatusHistory } from "@/types";
import {
  DEFAULT_STATUS_MESSAGES,
  ORDER_STATUS_LABELS,
  TRACKING_TIMELINE,
  timelineIndex,
} from "@/lib/orders/lifecycle";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TrackingTimelineProps {
  order: Order;
  history: OrderStatusHistory[];
}

export function TrackingTimeline({ order, history }: TrackingTimelineProps) {
  const currentIndex = timelineIndex(order.status);

  const eventsByStatus = new Map<string, OrderStatusHistory>();
  for (const event of history) {
    if (!eventsByStatus.has(event.new_status)) {
      eventsByStatus.set(event.new_status, event);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Tracking timeline
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Live status updates from the admin dashboard.
      </p>

      <div className="relative mt-6">
        <div className="absolute left-[13px] top-8 bottom-[20px] w-[2px] bg-border" />

        {TRACKING_TIMELINE.map((status, idx) => {
          const isCompleted = currentIndex >= 0 && idx <= currentIndex;
          const isCurrent = status === order.status;
          const event = eventsByStatus.get(status);
          const isLast = idx === TRACKING_TIMELINE.length - 1;

          return (
            <div key={status} className="relative pl-14 pb-6 last:pb-0">
              {!isLast && (
                <div className="absolute left-[13px] top-[34px] bottom-[2px] w-[2px] bg-border" />
              )}
              <div className="absolute left-[10px] top-[28px] z-10">
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border-2",
                    isCompleted
                      ? "border-success bg-success"
                      : "border-border bg-card",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-3.5 text-white" />
                  ) : (
                    <Circle className="size-2.5 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isCurrent
                        ? "text-foreground"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-brand-c100 px-2 py-0.5 text-[0.65rem] font-medium text-brand-ink">
                      Current
                    </span>
                  )}
                  {event && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.created_at)}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm",
                    isCompleted ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {event?.customer_message ?? DEFAULT_STATUS_MESSAGES[status]}
                </p>
                {event?.internal_note && (
                  <p className="text-xs italic text-muted-foreground">
                    Note: {event.internal_note}
                  </p>
                )}
                {status === "shipped" && order.courier_name && (
                  <p className="text-xs text-muted-foreground">
                    Courier: {order.courier_name}
                    {order.tracking_number ? ` · ${order.tracking_number}` : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentIndex < 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          This order is in an exceptional state. Please contact support for
          more information.
        </p>
      )}
    </div>
  );
}