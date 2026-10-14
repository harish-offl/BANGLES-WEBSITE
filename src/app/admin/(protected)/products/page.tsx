import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";

import { deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/ui";
import { SmartImage } from "@/components/shared/smart-image";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllProducts, getAdminCategories } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; saved?: string; deleted?: string }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;

  const [products, categories] = await Promise.all([
    getAllProducts({ q }),
    getAdminCategories(),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}${q ? ` matching “${q}”` : ""}.`}
        action={
          <Link href="/admin/products/new" className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2")}>
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Link>
        }
      />

      {params.saved ? (
        <p role="status" className="mb-4 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-foreground">
          Product saved.
        </p>
      ) : null}
      {params.deleted ? (
        <p role="status" className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
          Product deleted.
        </p>
      ) : null}

      <form method="get" className="mb-5 flex max-w-md gap-2" role="search">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search products by name, SKU or colour…"
          aria-label="Search products"
        />
        <Button type="submit" variant="outline" className="gap-2">
          <Search className="size-4" aria-hidden="true" />
          Search
        </Button>
      </form>

      {products.length === 0 ? (
        <EmptyState
          title={q ? "No products match your search" : "No products yet"}
          description={
            q
              ? "Try a different name, SKU or colour."
              : "Add your first product to start building the catalogue."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const category = product.category_id ? categoryById.get(product.category_id) : null;
                return (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-brand-c100">
                          <SmartImage
                            src={product.primary_image_url}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="block truncate font-medium text-foreground hover:text-gold-strong"
                          >
                            {product.name}
                          </Link>
                          {product.sku ? (
                            <span className="block text-xs text-muted-foreground">
                              {product.sku}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={product.is_active ? "default" : "outline"}>
                          {product.is_active ? "Active" : "Hidden"}
                        </Badge>
                        {product.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
                        {product.is_new_arrival ? <Badge variant="secondary">New</Badge> : null}
                        {product.stock_quantity !== null && product.stock_quantity <= 0 ? (
                          <Badge variant="destructive">Out of stock</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Link>
                        <DeleteButton
                          action={deleteProductAction}
                          id={product.id}
                          label={`Delete ${product.name}`}
                          confirmMessage={`Delete “${product.name}”? This cannot be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
