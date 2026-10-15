"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { loadWishlistProducts } from "@/app/wishlist/actions";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlistActions, useWishlistItems } from "@/hooks/use-wishlist";
import type { Product } from "@/types";

/**
 * Renders the saved list by resolving its stored ids against the live
 * catalogue, so prices and availability are always current. The list itself
 * lives only in the browser.
 */
export function WishlistView() {
  const items = useWishlistItems();
  const { clear } = useWishlistActions();
  const [resolved, setResolved] = useState<{ key: string; products: Product[] }>({
    key: "__initial__",
    products: [],
  });

  const idsKey = items.map((item) => item.productId).join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split(",") : [];
    const request = ids.length === 0 ? Promise.resolve<Product[]>([]) : loadWishlistProducts(ids);

    void request.then((result) => {
      if (!cancelled) setResolved({ key: idsKey, products: result });
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const loading = resolved.key !== idsKey;
  const products = loading ? [] : resolved.products;

  if (loading && items.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Skeleton key={item.productId} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your saved list is empty"
        description="Tap the heart on any piece to save it here for later."
        action={
          <Button render={<Link href="/shop" />} nativeButton={false}>
            Browse the collection
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {items.length} saved piece{items.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-gold-strong hover:underline"
        >
          Clear list
        </button>
      </div>
      <ProductGrid products={products} priorityCount={0} />
    </div>
  );
}
