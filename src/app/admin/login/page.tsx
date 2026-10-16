import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdminAccess, isLocalAdminAvailable } from "@/lib/admin/access";
import { isSupabaseConfigured } from "@/lib/data/driver";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Configuration the admin panel depends on. The login screen only ever reports
 * whether each variable is present — never its value — so a misconfigured
 * deployment can be diagnosed without leaking any secret.
 */
const ADMIN_CONFIG_VARS = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase project URL",
    present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase anon key",
    present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Service-role key — required to save changes",
    present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
];

export default async function AdminLoginPage() {
  const access = await getAdminAccess();
  if (access.ok) redirect("/admin");

  const supabaseConfigured = isSupabaseConfigured();
  const localAvailable = isLocalAdminAvailable();
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl tracking-[0.06em] text-foreground">
            Bangles <span className="text-gold-strong">by Beauty</span>
          </p>
          <div className="gold-rule mx-auto mt-3 h-px w-24" aria-hidden="true" />
          <p className="mt-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Admin panel
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {supabaseConfigured ? (
            <>
              <h1 className="font-display text-xl">Sign in</h1>
              <p className="mt-1 mb-5 text-sm text-muted-foreground">
                Use the administrator account for this store.
              </p>
              <AdminLoginForm mode="supabase" />
            </>
          ) : localAvailable ? (
            <>
              <h1 className="font-display text-xl">Local admin</h1>
              <p className="mt-1 mb-5 text-sm text-muted-foreground">
                Supabase is not configured, so this deployment is running on the local
                catalogue copy. Enter the local passphrase to manage it.
              </p>
              <AdminLoginForm mode="local" />
            </>
          ) : isProduction ? (
            <div className="text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-c100 text-gold-strong">
                <Settings2 className="size-5" aria-hidden="true" />
              </span>
              <h1 className="mt-4 font-display text-xl">Admin sign-in is not configured</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This deployment is missing its Supabase configuration, so administrator
                sign-in is disabled. Set the variables below in your hosting provider
                (Vercel: Project → Settings → Environment Variables → Production) and
                redeploy.
              </p>
              <ul className="mt-4 space-y-2 rounded-lg border border-border bg-brand-smoke/40 p-3 text-left text-xs">
                {ADMIN_CONFIG_VARS.map((variable) => {
                  const present = variable.present;
                  return (
                    <li
                      key={variable.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-muted-foreground">
                        <code className="text-foreground">{variable.name}</code>
                        <span className="mt-0.5 block">{variable.label}</span>
                      </span>
                      <span
                        className={
                          present
                            ? "font-medium text-emerald-600"
                            : "font-medium text-destructive"
                        }
                      >
                        {present ? "set" : "missing"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Sign-in needs the two public variables. Saving products, categories,
                orders and settings also needs{" "}
                <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code>, which
                must never be exposed to the browser.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-c100 text-gold-strong">
                <Settings2 className="size-5" aria-hidden="true" />
              </span>
              <h1 className="mt-4 font-display text-xl">Admin is not available yet</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Configure <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable
                administrator sign-in. In local development you can instead set{" "}
                <code className="text-foreground">ALLOW_LOCAL_ADMIN=true</code> and{" "}
                <code className="text-foreground">ADMIN_LOCAL_PASSPHRASE</code>.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            Return to the storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
