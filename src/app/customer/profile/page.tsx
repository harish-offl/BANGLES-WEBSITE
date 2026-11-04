import Link from "next/link";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { getCustomerOrders } from "@/lib/orders/queries";

export const dynamic = "force-dynamic";

export default async function CustomerProfileOverviewPage() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const orders = await getCustomerOrders();
  const active = orders.filter(
    (o) =>
      !["delivered", "cancelled", "refunded", "returned"].includes(o.status),
  );
  const delivered = orders.filter((o) => o.status === "delivered");
  const cancelled = orders.filter((o) =>
    ["cancelled", "refunded", "returned"].includes(o.status),
  );

  const wishlistCount = await getWishlistCount(identity.userId);
  const cartCount = await getCartCount(identity.userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {identity.fullName ?? "valued customer"}. Manage your
          account, orders and preferences from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="My Orders"
          value={orders.length}
          icon={<Package className="size-5" />}
          href="/customer/profile/orders"
        />
        <StatCard
          label="Active Orders"
          value={active.length}
          icon={<Clock className="size-5" />}
          href="/customer/profile/orders"
        />
        <StatCard
          label="Delivered"
          value={delivered.length}
          icon={<Package className="size-5" />}
          href="/customer/profile/orders"
        />
        <StatCard
          label="Wishlist"
          value={wishlistCount}
          icon={<Heart className="size-5" />}
          href="/customer/profile/wishlist"
        />
        <StatCard
          label="Cart Items"
          value={cartCount}
          icon={<ShoppingCart className="size-5" />}
          href="/customer/profile/cart"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Recent Orders
          </h2>
          <Link
            href="/customer/profile/orders"
            className="text-sm font-medium text-gold-strong hover:underline"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              You have not placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-flex items-center rounded-lg border border-border bg-brand-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-5 hover:border-brand-c300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-brand-c100 text-brand-ink">
          {icon}
        </div>
      </div>
    </Link>
  );
}

async function getWishlistCount(userId: string): Promise<number> {
  try {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { count } = await supabase
      .from("customer_wishlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getCartCount(userId: string): Promise<number> {
  try {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data } = await supabase
      .from("customer_cart")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return 0;
    const { count } = await supabase
      .from("customer_cart_items")
      .select("*", { count: "exact", head: true })
      .eq("cart_id", data.id);
    return count ?? 0;
  } catch {
    return 0;
  }
}

import { Package } from "lucide-react";
import { Clock } from "lucide-react";
import { Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { OrderCard } from "@/components/account/order-card";