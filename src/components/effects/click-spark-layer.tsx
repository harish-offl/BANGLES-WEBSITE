"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import ClickSpark from "./click-spark";

/** Brand-appropriate spark palette: antique gold, highlight gold and blush. */
const SPARK_COLORS = ["#c9a24a", "#e2c878", "#e08d80", "#f0ada2"];

/**
 * Site-wide celebration layer. Taps and clicks across the storefront scatter a
 * short burst of gold sparks. Disabled inside the admin panel, and the spark
 * canvas already honours `prefers-reduced-motion`.
 */
export function ClickSparkLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/developers")) {
    return <>{children}</>;
  }

  return (
    <ClickSpark
      sparkColor={SPARK_COLORS}
      shape="star"
      sparkCount={8}
      sparkSize={9}
      sparkWidth={2}
      sparkRadius={22}
      duration={480}
      randomness={0.35}
      glow={0.5}
    >
      {children}
    </ClickSpark>
  );
}
