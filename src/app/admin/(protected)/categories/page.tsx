import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { SmartImage } from "@/components/shared/smart-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCategories } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Categories" };

interface CategoriesPageProps {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const categories = await getAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} collection${categories.length === 1 ? "" : "s"}. These drive storefront navigation and filters.`}
        action={
          <Link
            href="/admin/categories/new"
            className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2")}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add category
          </Link>
        }
      />

      {params.saved ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-foreground"
        >
          Category saved.
        </p>
      ) : null}
      {params.deleted ? (
        <p
          role="status"
          className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          Category deleted.
        </p>
      ) : null}
      {params.error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {params.error}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first collection to group products on the storefront."
          action={
            <Link
              href="/admin/categories/new"
              className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2")}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add category
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Sort</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-brand-c100">
                        <SmartImage
                          src={category.image_url}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="block truncate font-medium text-foreground hover:text-gold-strong"
                        >
                          {category.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {category.slug}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {category.product_count ?? 0}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {category.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={category.is_active ? "default" : "outline"}>
                      {category.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                      <DeleteButton
                        action={deleteCategoryAction}
                        id={category.id}
                        label={`Delete ${category.name}`}
                        confirmMessage={`Delete “${category.name}”? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
