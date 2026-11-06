"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { signOutAction } from "@/app/admin/login/actions";
import { AdminNav } from "@/components/admin/admin-nav";

interface AdminShellProps {
  displayName: string;
  mode: "supabase" | "local";
  children: React.ReactNode;
}

export function AdminShell({ displayName, mode, children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock background scrolling and support Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 self-start border-r border-border bg-card transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col ${sidebarCollapsed ? "w-[4.5rem]" : "w-64"}`}
      >
        <div className={`border-b border-border py-4 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between gap-2"}`}>
            <Link href="/admin" className="font-display text-lg tracking-[0.04em] text-foreground" aria-label="Bangles by Beauty admin">
              {sidebarCollapsed ? "BB" : <>Bangles <span className="text-gold-strong">by Beauty</span></>}
            </Link>
            <button type="button" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"} title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
            </button>
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
            <button type="submit" className={`w-full gap-2 ${sidebarCollapsed ? "justify-center px-0" : "justify-start"}`} aria-label="Sign out">
              <LogOut className="size-4" aria-hidden="true" />
              {!sidebarCollapsed ? "Sign out" : null}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Mobile drawer */}
      <aside
        id="admin-mobile-navigation"
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] max-w-[86vw] flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <span className="grid size-8 place-items-center rounded bg-brand-c100 font-semibold text-brand-ink">BB</span>
            <span className="font-display text-lg tracking-[0.04em] text-foreground">
              Bangles <span className="text-gold-strong">by Beauty</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <AdminNav onNavigate={() => setDrawerOpen(false)} />
        </div>
        <div className="border-t border-border p-4">
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{displayName}</span>
          </p>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-foreground hover:bg-brand-c100" aria-label="Sign out">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1">
        {/* Mobile header bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur lg:hidden">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-foreground hover:bg-accent/50"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Link href="/admin" className="flex min-w-0 items-center gap-2 font-display text-base tracking-[0.04em] text-foreground" aria-label="Bangles by Beauty admin">
            <span className="grid size-8 shrink-0 place-items-center rounded bg-brand-c100 text-sm font-semibold text-brand-ink">BB</span>
            <span className="truncate">Bangles <span className="text-gold-strong">by Beauty</span></span>
          </Link>
          <form action={signOutAction} className="ml-auto">
            <button
              type="submit"
              className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          </form>
        </header>

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
