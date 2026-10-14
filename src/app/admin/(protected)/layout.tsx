import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin/access";

export const dynamic = "force-dynamic";

/**
 * Guarded admin area. Every route under this group requires an authenticated
 * administrator (Supabase mode) or a local admin session. The check runs on the
 * server for every request — the UI never decides access on its own.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess();
  if (!access.ok) redirect("/admin/login");

  return (
    <AdminShell displayName={access.displayName} mode={access.mode}>
      {children}
    </AdminShell>
  );
}
