export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading admin page…</span>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-72 max-w-full rounded bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl border border-border bg-card p-5"
          >
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-4 h-7 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="mb-6 h-6 w-40 rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="size-11 shrink-0 rounded-lg bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
