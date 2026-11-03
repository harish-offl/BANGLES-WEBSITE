import type { Metadata } from "next";
import Link from "next/link";

import { AdminLoginCard } from "@/components/auth/admin-login-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in · Bangles by Beauty",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-3 py-6 sm:px-4 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 sm:mb-8 text-center">
          <p className="font-display text-xl sm:text-2xl tracking-[0.06em] text-foreground">
            Bangles <span className="text-gold-strong">by Beauty</span>
          </p>
          <div className="gold-rule mx-auto mt-2 sm:mt-3 h-px w-20 sm:w-24" aria-hidden="true" />
          <p className="mt-2 sm:mt-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Admin panel
          </p>
        </div>

        <AdminLoginCard />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            Return to the storefront
          </Link>
        </p>
      </div>
    </div>
  );
}