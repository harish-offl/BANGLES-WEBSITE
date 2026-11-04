import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { CustomerLoginCard } from "@/components/auth/customer-login-card";

export const metadata: Metadata = {
  title: "Customer login · Bangles by Beauty",
  description: "Sign in to your Bangles by Beauty customer account.",
};

export default async function CustomerLoginPage() {
  const identity = await getCustomerIdentity();
  if (identity) redirect("/customer/profile");

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
          <Link
            href="/login"
            className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to login options
          </Link>
        </div>
      </header>

      <main className="container-page flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-c100 text-brand-ink">
              <User className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
              Customer Login
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your orders, profile and tracking.
            </p>
          </div>

          <CustomerLoginCard />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Not an admin?{" "}
            <Link href="/login/admin" className="text-brand-ink font-semibold underline underline-offset-4">
              Use the admin portal instead
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}