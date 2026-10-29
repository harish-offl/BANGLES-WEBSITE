"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
  const standalonePortfolio =
    pathname === "/developers" || pathname.startsWith("/developers/");

  if (standalonePortfolio) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
      {floatingAction}
    </>
  );
}
