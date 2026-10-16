"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 self-start border-r border-border bg-card transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col ${sidebarCollapsed ? "w-[4.5rem]" : "w-64"}`}>
        <div className={`border-b border-border py-4 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between gap-2"}`}>
            <Link href="/admin" className="font-display text-lg tracking-[0.04em] text-foreground" aria-label="Bangles by Beauty admin">
              {sidebarCollapsed ? "BB" : <>Bangles <span className="text-gold-strong">by Beauty</span></>}
            </Link>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"} title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
            </Button>
          </div>
          {!sidebarCollapsed ? <p className="mt-1 px-1 text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase">Admin</p> : null}
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto p-4 ${sidebarCollapsed ? "px-2" : ""}`}>
          <AdminNav collapsed={sidebarCollapsed} />
        </div>
        <div className={`border-t border-border p-3 ${sidebarCollapsed ? "px-2" : ""}`}>
          {!sidebarCollapsed ? <p className="px-3 pb-2 text-xs text-muted-foreground">
            Signed in as <span className="text-foreground">{displayName}</span>
          </p> : null}
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className={`w-full gap-2 ${sidebarCollapsed ? "justify-center px-0" : "justify-start"}`} aria-label="Sign out">
              <LogOut className="size-4" aria-hidden="true" />
              {!sidebarCollapsed ? "Sign out" : null}
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
          <SheetContent side="left" className="admin-scope w-72">
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
        <div className="mx-auto w-full max-w-[1280px] p-4 py-6 sm:p-6 lg:p-8 xl:p-10">{children}</div>
      </main>
    </div>
  );
}
