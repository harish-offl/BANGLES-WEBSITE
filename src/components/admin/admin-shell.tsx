"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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

      {/* Mobile drawer overlay (backdrop) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="false"
        />
      )}

      <main className="min-w-0 flex-1 relative">
        {/* Mobile header bar */}
        <header className="border-b border-border bg-card sticky top-0 z-20 hidden md:hidden px-4 py-3 flex items-center justify-between">
          <button type="button" className="rounded-md p-2 text-foreground hover:bg-accent/50" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2 font-display text-lg tracking-[0.04em] text-foreground" aria-label="Bangles by Beauty admin">
              <span className="grid size-8 place-items-center rounded bg-brand-c100 text-brand-ink font-semibold">BB</span>
              <span>Bangles <span className="text-gold-strong">by Beauty</span></span>
            </Link>
          </div>
          <button type="button" className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground" aria-label="Admin profile">
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </header>

        {/* Mobile drawer content */}
        <aside className={`absolute inset-y-0 left-0 z-50 w-[280px] h-full bg-card shadow-2xl transform transition-transform duration-300 ease-in-out hidden md:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded bg-brand-c100 text-brand-ink font-semibold">BB</span>
              <span className="font-display text-lg tracking-[0.04em] text-foreground">Admin</span>
            </div>
            <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-accent/50" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
              <PanelLeftClose className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="overflow-y-auto flex-1 p-3">
            <AdminNav collapsed={false} />
          </nav>
          <div className="border-t border-border p-4">
            <p className="px-3 pb-2 text-xs text-muted-foreground">Signed in as <span className="text-foreground font-medium">{displayName}</span></p>
            <form action={signOutAction}>
              <button type="submit" className="w-full gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-brand-c100 border border-transparent" aria-label="Sign out">
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </aside>

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
