import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyAside } from "@/components/content/policy-aside";
import { PolicyContent } from "@/components/content/policy-content";
import { PageShell } from "@/components/shared/page-shell";
import { POLICY_PAGES } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description:
    "What to do if your handmade Bangles by Beauty order arrives damaged or is not as discussed.",
  alternates: { canonical: "/returns-policy" },
};

export default function ReturnsPolicyPage() {
  const page = POLICY_PAGES["returns-policy"];
  if (!page) notFound();

  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      aside={<PolicyAside topic="returns" />}
    >
      <PolicyContent page={page} />
    </PageShell>
  );
}
