import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in · Bangles by Beauty",
  description: "Choose your account type to continue — customer or admin.",
};

export default function CommonLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card">
        <div className="container-page flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand-c100 text-brand-ink font-semibold">
              B
            </span>
            <span className="font-display text-lg tracking-[0.06em] text-foreground">
              Bangles by Beauty
            </span>
          </Link>
        </div>
      </header>

      <main className="container-page flex flex-1 items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-3xl">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome to Bangles by Beauty
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Choose your account type to continue.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Link
              href="/login/customer"
              className="group flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(146,91,99,0.14)] sm:p-8"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-brand-c100 text-brand-ink">
                <User className="size-6" aria-hidden="true" />
              </span>
              <div className="flex flex-1 flex-col gap-2">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Customer Login
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Access your personal account, explore your order history, track
                  purchases, manage favourites and update your profile.
                </p>
              </div>
              <span className="inline-flex items-center text-sm font-semibold text-gold-strong">
                Access account
                <ShoppingBag className="ml-2 size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/login/admin"
              className="group flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(146,91,99,0.14)] sm:p-8"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-brand-c100 text-brand-ink">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <div className="flex flex-1 flex-col gap-2">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Admin Login
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Access the administration dashboard to manage products, orders,
                  customers, inventory and website operations.
                </p>
              </div>
              <span className="inline-flex items-center text-sm font-semibold text-gold-strong">
                Access admin dashboard
                <ShieldCheck className="ml-2 size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}