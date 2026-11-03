"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CustomerIdentity } from "@/lib/auth/auth-utils";

const NAV = [
  { href: "/account", label: "Overview", icon: User, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package, exact: false },
];

export function AccountShell({
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
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
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
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}

export type { CustomerIdentity };