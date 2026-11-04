import { redirect } from "next/navigation";

import { CustomerProfileShell } from "@/components/customer-profile/customer-profile-shell";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";

export const dynamic = "force-dynamic";

export default async function CustomerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/customer/profile");

  return <CustomerProfileShell identity={identity}>{children}</CustomerProfileShell>;
}
