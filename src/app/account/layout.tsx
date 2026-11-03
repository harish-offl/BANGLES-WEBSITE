import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/account-shell";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account");

  return <AccountShell identity={identity}>{children}</AccountShell>;
}