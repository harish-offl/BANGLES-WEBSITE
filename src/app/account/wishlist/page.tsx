import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCustomerWishlist } from "@/lib/customers/wishlist";
import { formatPrice } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const wishlist = await getCustomerWishlist();

  if (!wishlist) redirect("/login?redirect=/account/wishlist");

  const items = wishlist.items;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your wishlist is empty.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Save products you love to your wishlist.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center rounded-lg border border-border bg-brand-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          My Wishlist
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} saved item{items.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.productId}
            href={`/products/${item.sku ?? item.productId}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="relative aspect-square overflow-hidden bg-brand-c100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <h3 className="font-display text-base leading-snug text-foreground line-clamp-2">
                  {item.name}
                </h3>
                {item.sku && (
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Code {item.sku}
                  </p>
                )}
              </div>
              <div className="mt-auto space-y-3 pt-1">
                <div className="flex min-w-0 items-end justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {formatPrice(item.price, "INR")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
