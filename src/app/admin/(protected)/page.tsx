import Link from "next/link";
import { ArrowRight, ImageOff, Package } from "lucide-react";

import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin/queries";
import { getDataModeInfo } from "@/lib/data/driver";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [overview, modeInfo] = await Promise.all([
    getAdminOverview(),
    Promise.resolve(getDataModeInfo()),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="A snapshot of the catalogue. Edits here update the storefront within seconds."
        action={
          <Link href="/admin/products/new" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            Add product
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={overview.totalProducts} href="/admin/products" />
        <StatCard label="Active" value={overview.activeProducts} hint="Live in the storefront" />
        <StatCard label="Featured" value={overview.featuredProducts} hint="Home featured rail" />
        <StatCard label="New arrivals" value={overview.newArrivals} hint="New arrivals rail" />
        <StatCard
          label="Categories"
          value={`${overview.activeCategories}/${overview.totalCategories}`}
          hint="Active / total"
          href="/admin/categories"
        />
        <StatCard
          label="Out of stock"
          value={overview.outOfStock}
          hint="Tracked items only"
        />
        <StatCard
          label="Missing images"
          value={overview.missingImages}
          hint="Products without a photo"
        />
        <StatCard label="Data source" value={modeInfo.mode === "supabase" ? "beautybybangles" : "Local"} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">Quick actions</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                href="/admin/products/new"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-gold/50 hover:bg-brand-c100/50"
              >
                <span className="flex items-center gap-2">
                  <Package className="size-4 text-gold-strong" aria-hidden="true" />
                  Add a new product
                </span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-gold/50 hover:bg-brand-c100/50"
              >
                <span className="flex items-center gap-2">
                  <Package className="size-4 text-gold-strong" aria-hidden="true" />
                  Manage categories
                </span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-gold/50 hover:bg-brand-c100/50"
              >
                <span className="flex items-center gap-2">
                  <Package className="size-4 text-gold-strong" aria-hidden="true" />
                  Update store settings
                </span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg">
            <ImageOff className="size-4 text-gold-strong" aria-hidden="true" />
            Data source
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{modeInfo.reason}</p>
          {overview.missingImages > 0 ? (
            <p className="mt-3 rounded-lg border border-gold/40 bg-brand-c100 px-3 py-2 text-xs text-foreground">
              {overview.missingImages} product{overview.missingImages === 1 ? "" : "s"} have no
              image yet. Add photos so listings look complete.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
