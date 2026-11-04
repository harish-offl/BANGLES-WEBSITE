import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCustomerCart } from "@/lib/customers/cart";
import { formatPrice } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function CustomerProfileCartPage() {
  const cart = await getCustomerCart();

  if (!cart) redirect("/login?redirect=/customer/profile/cart");

  const items = cart.items;
  const subtotal = cart.total;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            My Cart
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your cart is empty.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&rsquo;t added any items to your cart yet.
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
          My Cart
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your items before checkout.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-brand-c100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.sku ?? item.productId}`}
                  className="block"
                >
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                    {item.name}
                  </h3>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground">
                      Code {item.sku}
                    </p>
                  )}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Quantity {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {formatPrice(item.lineTotal, "INR")}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatPrice(subtotal, "INR")}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {formatPrice(subtotal, "INR")}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/shop"
            className="rounded-lg border border-border bg-brand-white px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
          >
            Continue shopping
          </Link>
          <Link
            href="/checkout"
            className="rounded-lg bg-brand-c100 px-4 py-3 text-sm font-medium text-brand-ink hover:bg-brand-c200"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
