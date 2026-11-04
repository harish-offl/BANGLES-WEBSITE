import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCustomerNotifications } from "@/lib/customers/notifications";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function CustomerProfileNotificationsPage({ params }: PageProps) {
  const notifications = await getCustomerNotifications();

  if (!notifications) redirect("/login?redirect=/customer/profile/notifications");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount} unread
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border border-border bg-card p-4 ${
                !n.is_read ? "bg-brand-c100/30 border-gold-strong" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex size-4 items-center justify-center rounded-full ${
                  !n.is_read ? "bg-gold-strong text-white" : "bg-border text-muted-foreground"
                }`} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {n.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {n.order_id && (
                    <Link
                      href={`/customer/profile/orders/${n.order_id}/track`}
                      className="mt-2 text-xs font-medium text-gold-strong hover:underline"
                    >
                      View order →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
