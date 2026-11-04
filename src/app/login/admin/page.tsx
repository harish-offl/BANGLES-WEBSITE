import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminLoginCard } from "@/components/auth/admin-login-card";
import { getAdminAccess } from "@/lib/admin/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin login · Bangles by Beauty",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const access = await getAdminAccess();
  if (access.ok) redirect("/admin");

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

      <main className="container-page flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-c100 text-gold-strong">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage Bangles by Beauty.
            </p>
          </div>

          <AdminLoginCard />
        </div>
      </main>
    </div>
  );
}