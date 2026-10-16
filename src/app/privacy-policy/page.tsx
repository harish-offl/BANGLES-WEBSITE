import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyAside } from "@/components/content/policy-aside";
import { PolicyContent } from "@/components/content/policy-content";
import { PageShell } from "@/components/shared/page-shell";
import { POLICY_PAGES } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Bangles by Beauty collects, uses and protects the information you share when you enquire.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  const page = POLICY_PAGES["privacy-policy"];
  if (!page) notFound();

  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      aside={<PolicyAside topic="privacy" />}
    >
      <PolicyContent page={page} />
    </PageShell>
  );
}
