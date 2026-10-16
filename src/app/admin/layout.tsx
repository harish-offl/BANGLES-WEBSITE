import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Bare wrapper for the admin area. Access control lives in the `(protected)`
 * route group so the sign-in page can render without a session.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-scope min-h-dvh bg-brand-smoke">{children}</div>;
}
