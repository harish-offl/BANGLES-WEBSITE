"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, Clock, ShoppingCart, Heart, MapPin, CreditCard, Bell, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CustomerIdentity } from "@/lib/auth/auth-utils";
import LogoutButton from "./logout-button";

const NAV = [
  { id: "overview", href: "/customer/profile", label: "Overview", icon: User },
  { id: "orders", href: "/customer/profile/orders", label: "My Orders", icon: Package },
  { id: "tracking", href: "/customer/profile/track-orders", label: "Track Orders", icon: Clock },
  { id: "info", href: "/customer/profile/info", label: "Customer Info", icon: User },
  { id: "cart", href: "/customer/profile/cart", label: "My Cart", icon: ShoppingCart },
  { id: "wishlist", href: "/customer/profile/wishlist", label: "Favourites", icon: Heart },
  { id: "addresses", href: "/customer/profile/addresses", label: "Addresses", icon: MapPin },
  { id: "settings", href: "/customer/profile/settings", label: "Account Settings", icon: Settings },
] as const;

export function CustomerProfileShell({
  identity,
  children,
}: {
  identity: CustomerIdentity;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-brand-c100 text-brand-ink">
              <User className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {identity.fullName ?? "Customer"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {identity.email ?? "Signed in customer"}
              </p>
            </div>
          </div>

          <nav aria-label="Account" className="space-y-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-c100 text-brand-ink"
                      : "text-muted-foreground hover:bg-brand-c100 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-6 pt-4 border-t border-border">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
