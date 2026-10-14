"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";

import { signOutAction } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AdminShellProps {
  displayName: string;
  mode: "supabase" | "local";
  children: React.ReactNode;
}

export function AdminShell({ displayName, mode, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-5">
          <Link href="/admin" className="font-display text-lg tracking-[0.04em] text-foreground">
            Bangles <span className="text-gold-strong">by Beauty</span>
          </Link>
          <p className="mt-1 text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase">
            Admin
          </p>
        </div>
        <div className="flex-1 p-3">
          <AdminNav />
        </div>
        <div className="border-t border-border p-3">
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            Signed in as <span className="text-foreground">{displayName}</span>
          </p>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-display text-base tracking-[0.04em] text-foreground">
          Bangles <span className="text-gold-strong">by Beauty</span>
        </Link>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open admin menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-4" aria-hidden="true" />
          </Button>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Admin menu</SheetTitle>
              <SheetDescription className="sr-only">Navigate the admin panel</SheetDescription>
            </SheetHeader>
            <div className="px-3 pb-3" onClick={() => setMenuOpen(false)}>
              <AdminNav />
            </div>
            <div className="mt-auto border-t border-border p-3">
              <p className="px-3 pb-2 text-xs text-muted-foreground">
                Signed in as <span className="text-foreground">{displayName}</span>
              </p>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-w-0 flex-1">
        {mode === "local" ? (
          <div className="border-b border-gold/40 bg-brand-c100 px-4 py-2.5 text-xs text-foreground lg:px-8">
            <strong className="font-medium">Local mode.</strong> Supabase is not configured, so
            changes are written to <code>.data/catalog.json</code> and are not persisted to a
            database.
          </div>
        ) : null}
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
