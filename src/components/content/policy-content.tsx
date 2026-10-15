import Link from "next/link";
import { Info } from "lucide-react";

import { Prose } from "@/components/shared/page-shell";
import type { PolicyPage } from "@/lib/content/legal";

interface PolicyContentProps {
  page: PolicyPage;
}

export function PolicyContent({ page }: PolicyContentProps) {
  return (
    <div className="space-y-8">
      {page.pendingApproval ? (
        <div className="flex max-w-2xl gap-3 rounded-xl border border-gold/40 bg-brand-c100 px-4 py-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-foreground sm:text-sm">
            This policy is a working draft prepared for the site rebuild and is awaiting the
            owner&rsquo;s approval. The essentials are accurate, but the final wording should be
            reviewed before launch. For anything urgent, please{" "}
            <Link href="/#visit" className="font-medium text-gold-strong underline underline-offset-2">
              contact us
            </Link>
            .
          </p>
        </div>
      ) : null}

      <div className="max-w-2xl rounded-2xl border border-border bg-brand-paper p-5 sm:p-6">
        <h2 className="text-[0.7rem] font-medium tracking-[0.2em] text-foreground uppercase">
          In short
        </h2>
        <ul className="mt-3 space-y-2">
          {page.summary.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Prose className="max-w-2xl">
        {page.sections.map((section) => (
          <section key={section.heading} className="scroll-mt-28">
            <h2>{section.heading}</h2>
            {section.body ? <p className="mt-3">{section.body}</p> : null}
            {section.list ? (
              <ul className="mt-3">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </Prose>
    </div>
  );
}
