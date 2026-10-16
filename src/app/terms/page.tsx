import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyAside } from "@/components/content/policy-aside";
import { PolicyContent } from "@/components/content/policy-content";
import { PageShell } from "@/components/shared/page-shell";
import { POLICY_PAGES } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "The terms that apply when you browse the Bangles by Beauty catalogue and send an enquiry.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const page = POLICY_PAGES.terms;
  if (!page) notFound();

  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      aside={<PolicyAside topic="terms" />}
    >
      <PolicyContent page={page} />
    </PageShell>
  );
}
