"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, Package, Search } from "lucide-react";

import { StatCard } from "@/components/admin/ui";
import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

interface InventoryFilters {
  q?: string;
  category: string;
  stock: "all" | "out" | "low" | "no-sizes";
}

interface AdminInventoryClientProps {
  products: Product[];
  categories: Category[];
  categoryById: Record<string, Category>;
  pagination: PaginationMeta;
  filters: InventoryFilters;
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

type StockFilter = "all" | "out" | "low" | "no-sizes";

function productStock(product: Product): number {
  return (product.variants ?? []).reduce(
    (sum, variant) => sum + (variant.stock_quantity ?? 0),
    0,
  );
}

export default function AdminInventoryClient({
  products,
  categories,
  categoryById,
  pagination,
  filters,
  totalProducts,
  totalVariants,
  totalStock,
  lowStockProducts,
  outOfStockProducts,
}: AdminInventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stockFilter, setStockFilter] = useState<StockFilter>(
    (filters.stock ?? "all") as StockFilter,
  );

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (stockFilter === "all") {
      next.delete("stock");
    } else {
      next.set("stock", stockFilter);
    }
    router.push(`?${next.toString()}`, { scroll: false });
  }, [stockFilter, searchParams, router]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = productStock(product);
      const variantCount = product.variants?.length ?? 0;
      if (stockFilter === "out" && stock !== 0) return false;
      if (stockFilter === "low" && !(stock > 0 && stock <= 5)) return false;
      if (stockFilter === "no-sizes" && variantCount > 0) return false;
      return true;
    });
  }, [products, stockFilter]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { page, pageSize, total, pageCount } = pagination;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(start + filteredProducts.length - 1, total);

  function setCategory(value: string) {
    const next = new URLSearchParams();
    next.set("q", filters.q ?? "");
    next.set("category", value);
    next.set("page", "1");
    if (stockFilter !== "all") next.set("stock", stockFilter);
    router.push(`?${next.toString()}`, { scroll: false });
  }

  function goToPage(targetPage: number) {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    next.set("category", filters.category);
    next.set("page", String(targetPage));
    if (stockFilter !== "all") next.set("stock", stockFilter);
    router.push(`?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total products" value={totalProducts} />
        <StatCard label="Size variants" value={totalVariants} />
        <StatCard label="Total stock" value={totalStock} />
        <StatCard label="Low stock (\u22645)" value={lowStockProducts} />
        <StatCard label="Out of stock" value={outOfStockProducts} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-lg">Product inventory</h2>
            <p className="text-sm text-muted-foreground">
              Showing {start}\u2013{end} of {total} products
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const q = String(formData.get("q") ?? "");
                const next = new URLSearchParams();
                if (q) next.set("q", q);
                next.set("category", filters.category);
                next.set("page", "1");
                if (stockFilter !== "all") next.set("stock", stockFilter);
                router.push(`?${next.toString()}`, { scroll: false });
              }}
              className="relative flex items-center gap-2"
            >
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Search name, SKU, size or colour\u2026"
                aria-label="Search products"
                className="w-full pl-9 sm:w-64"
              />
            </form>
            <select
              value={filters.category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
              aria-label="Filter by stock status"
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="all">All stock</option>
              <option value="out">Out of stock</option>
              <option value="low">Low stock (\u22645)</option>
              <option value="no-sizes">No sizes added</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium tabular-nums">S.No</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Total stock</th>
                <th className="px-4 py-3 font-medium">Sizes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No products match the current filters.
                  </td>
                </tr>
              ) : null}
              {filteredProducts.map((product, index) => {
                const category = product.category_id
                  ? categoryById[String(product.category_id)]
                  : undefined;
                const variants = product.variants ?? [];
                const stock = productStock(product);
                const isOutOfStock = stock === 0;
                const isLowStock = stock > 0 && stock <= 5;
                const isExpanded = expanded.has(product.id);
                const serialNumber = (page - 1) * pageSize + index + 1;
                return (
                  <Fragment key={product.id}>
                    <tr className="border-b border-border last:border-0">
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {serialNumber}
                      </td>
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
                        {category?.name ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-right font-medium">
                        {stock}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {variants.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(product.id)}
                            className="inline-flex items-center gap-1 text-left hover:text-foreground"
                            aria-expanded={isExpanded}
                          >
                            {variants.length} size{variants.length === 1 ? "" : "s"}
                            {isExpanded ? (
                              <ChevronUp className="size-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="size-3.5" aria-hidden="true" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs">No sizes added yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            isOutOfStock
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : isLowStock
                                ? "bg-warning/10 text-warning-foreground border border-warning/20"
                                : "bg-brand-c100 text-brand-ink border border-brand-c300",
                          )}
                        >
                          {isOutOfStock
                            ? "Out of stock"
                            : isLowStock
                              ? "Low stock"
                              : "In stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/inventory/${product.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-8 gap-2",
                          )}
                        >
                          {variants.length > 0 ? "Manage stock" : "Add sizes"}
                          <Package className="size-4 ml-1" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-b border-border bg-brand-c50/40">
                        <td colSpan={7} className="px-4 py-4">
                          {variants.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                Size-wise stock
                              </p>
                              <table className="w-full max-w-md text-sm">
                                <thead>
                                  <tr className="text-left text-xs text-muted-foreground uppercase">
                                    <th className="py-1 font-medium">Size</th>
                                    <th className="py-1 font-medium text-right">
                                      Stock
                                    </th>
                                    <th className="py-1 font-medium text-right">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variants.map((variant) => {
                                    const variantStock = variant.stock_quantity ?? 0;
                                    return (
                                      <tr key={variant.id}>
                                        <td className="py-1 pr-4 tabular-nums">
                                          {variant.variant_value}
                                        </td>
                                        <td className="py-1 text-right tabular-nums">
                                          {variantStock}
                                        </td>
                                        <td className="py-1 text-right text-xs text-muted-foreground">
                                          {variantStock === 0
                                            ? "Out of stock"
                                            : variantStock <= 5
                                              ? "Low"
                                              : "In stock"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No sizes added yet. Add sizes and stock on the product
                              inventory page.
                            </p>
                          )}
                          <Link
                            href={`/admin/inventory/${product.id}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "mt-3 h-8",
                            )}
                          >
                            {variants.length > 0 ? "Manage sizes" : "Add sizes"}
                          </Link>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <nav className="mt-6 flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Page {page} of {pageCount} ({total} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-input bg-transparent text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === pageCount}
                className="px-3 py-1.5 text-sm rounded-lg border border-input bg-transparent text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
