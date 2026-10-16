import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyAside } from "@/components/content/policy-aside";
import { PolicyContent } from "@/components/content/policy-content";
import { PageShell } from "@/components/shared/page-shell";
import { POLICY_PAGES } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Shipping policy",
  description:
    "Our made-to-order processing time of 5 to 7 days and free delivery on orders above ₹2499.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  const page = POLICY_PAGES["shipping-policy"];
  if (!page) notFound();

  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      aside={<PolicyAside topic="shipping" />}
    >
      <PolicyContent page={page} />
    </PageShell>
  );
}
