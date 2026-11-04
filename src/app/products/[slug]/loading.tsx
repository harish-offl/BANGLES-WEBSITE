import React from "react";
export default function ProductLoading() {
  return (
    <div className="container-page py-8 sm:py-10 animate-pulse">
      <BreadcrumbsSkeleton />
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-4">
            <div className="h-48 w-full rounded-2xl border border-dashed border-border bg-brand-c100" />
            <div className="h-8 w-1/3 rounded bg-brand-c100" />
            <h1 className="h-8 w-full rounded bg-brand-c100" />
            <div className="h-4 w-1/2 rounded bg-brand-c100" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="h-4 w-1/4 rounded bg-brand-c100" />
              <div className="h-4 w-1/2 rounded bg-brand-c100" />
              <div className="h-4 w-full rounded bg-brand-c100" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-1/3 rounded bg-brand-c100" />
              <div className="h-10 w-1/2 rounded bg-brand-c100" />
              <div className="h-10 w-2/3 rounded bg-brand-c100" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <li key={i} className="h-12 w-full rounded-xl border border-border bg-brand-c100" />
              ))}
            </ul>
          </div>
        </div>
        <section className="mt-14 border-t border-border pt-10">
          <div className="space-y-2">
            <div className="h-4 w-1/3 rounded bg-brand-c100" />
            <h1 className="h-6 w-1/2 rounded bg-brand-c100" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-brand-c100">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/50" />
                  <div className="flex-1 flex-col p-4">
                    <div className="h-4 w-3/4 rounded bg-white/30" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-white/30" />
                    <div className="mt-auto h-8 w-full rounded bg-white/30" />
                  </div>
                </article>
              </li>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function BreadcrumbsSkeleton() {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
      {[1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <span className="h-3 w-12 rounded bg-brand-c100" />
          <span className="h-3 w-1 rounded bg-brand-c100" />
        </React.Fragment>
      ))}
    </div>
  );
}
