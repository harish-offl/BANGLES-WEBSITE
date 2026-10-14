import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/shared/breadcrumbs";
import { cn } from "@/lib/utils";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  children: ReactNode;
  className?: string;
  /** Optional sidebar rendered beside the main content on large screens. */
  aside?: ReactNode;
}

/**
 * Shared layout for static content and policy pages: breadcrumbs, an editorial
 * header and a readable content column.
 */
export function PageShell({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  className,
  aside,
}: PageShellProps) {
  return (
    <div className={cn("container-page py-8 sm:py-10", className)}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}

      <header className="mt-5 max-w-3xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="section-title text-balance">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </header>

      <div
        className={cn(
          "mt-8",
          aside && "grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start",
        )}
      >
        <div className={cn(aside && "min-w-0")}>{children}</div>
        {aside ? <div className="lg:sticky lg:top-28">{aside}</div> : null}
      </div>
    </div>
  );
}

interface ProseProps {
  children: ReactNode;
  className?: string;
}

/** Readable long-form column with consistent vertical rhythm. */
export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base",
        "[&_a]:text-gold-strong [&_a]:underline [&_a]:underline-offset-2",
        "[&_h2]:font-display [&_h2]:text-xl [&_h2]:font-normal [&_h2]:text-foreground [&_h2]:tracking-normal",
        "[&_h3]:font-display [&_h3]:text-base [&_h3]:text-foreground",
        "[&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
