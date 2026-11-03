export default function ShopLoading() {
  return (
    <div className="container-page py-8 sm:py-10 animate-pulse">
      <div className="mt-5 max-w-3xl">
        <div className="h-4 w-1/3 rounded bg-brand-c100" />
        <h1 className="mt-3 h-10 w-full rounded bg-brand-c100" />
        <div className="mt-3 h-4 w-3/4 rounded bg-brand-c100" />
      </div>

      <div className="mt-8">
        <div className="h-10 w-full rounded bg-brand-c100 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      </div>
    </div>
  );
}
