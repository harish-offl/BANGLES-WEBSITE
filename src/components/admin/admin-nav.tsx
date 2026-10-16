"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package, exact: false },
  { href: "/admin/categories", label: "Categories", Icon: FolderTree, exact: false },
  { href: "/admin/orders", label: "Enquiries", Icon: ShoppingBag, exact: false },
  { href: "/admin/settings", label: "Settings", Icon: Settings, exact: false },
] as const;

export function AdminNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1.5">
      {LINKS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary/10 bg-brand-c100 font-semibold text-primary"
                : "text-muted-foreground hover:bg-brand-c100/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
          </Link>
        );
      })}

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-brand-c100/60 hover:text-foreground"
      >
        <Store className="size-4 shrink-0" aria-hidden="true" />
        <span className={cn("truncate", collapsed && "lg:hidden")}>View store</span>
      </Link>
    </nav>
  );
}
