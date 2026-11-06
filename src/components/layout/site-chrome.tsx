"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ClickSparkLayer } from "@/components/effects/click-spark-layer";

interface SiteChromeProps {
  header: ReactNode;
  footer: ReactNode;
  floatingAction: ReactNode;
  children: ReactNode;
}

export function SiteChrome({
  header,
  footer,
  floatingAction,
  children,
}: SiteChromeProps) {
  const pathname = usePathname();
  const standalone =
    pathname === "/developer" ||
    pathname === "/developers" ||
    pathname.startsWith("/developers/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (standalone) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main id="main-content" className="flex-1">
        <ClickSparkLayer>{children}</ClickSparkLayer>
      </main>
      {footer}
      {floatingAction}
    </>
  );
}
