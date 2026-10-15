import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface ListingPaginationProps {
  /** Current page (1-based). */
  page: number;
  pageCount: number;
  /** Query string without the `page` parameter (e.g. `category=bridal&sort=price-asc`). */
  baseParams: string;
  basePath: string;
}

function href(basePath: string, baseParams: string, page: number): string {
  const params = new URLSearchParams(baseParams);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Compact page window with first/last and neighbours, collapsing the rest. */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

export function ListingPagination({
  page,
  pageCount,
  baseParams,
  basePath,
}: ListingPaginationProps) {
  if (pageCount <= 1) return null;

  const items = pageWindow(page, pageCount);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={href(basePath, baseParams, page - 1)}
          aria-label="Previous page"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : null}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-2 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(basePath, baseParams, item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
              item === page
                ? "border-gold-strong bg-brand-c100 font-medium text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={href(basePath, baseParams, page + 1)}
          aria-label="Next page"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
