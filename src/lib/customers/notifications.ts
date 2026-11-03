import "server-only";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { getCatalog } from "@/lib/data";

export async function getCustomerNotifications() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;
  return getCatalog().listCustomerNotifications(identity.userId);
}

export async function markNotificationRead(id: string): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = getServiceRoleClient();
  await supabase
    .from("customer_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("customer_id", identity.userId);
}

export async function markAllNotificationsRead(): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = getServiceRoleClient();
  await supabase
    .from("customer_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("customer_id", identity.userId)
    .eq("is_read", false);
}
