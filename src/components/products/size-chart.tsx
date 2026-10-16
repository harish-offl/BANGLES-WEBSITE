"use client";

import { Ruler } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BANGLE_SIZE_CHART } from "@/lib/product-sizes";
import { cn } from "@/lib/utils";

interface SizeChartProps {
  className?: string;
}

/**
 * "Size Chart" trigger that opens a modal with the bangle diameter guide.
 * Sizes and measurements live in `src/lib/product-sizes.ts`.
 */
export function SizeChart({ className }: SizeChartProps) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-gold-strong underline underline-offset-4 transition-colors hover:text-foreground",
          className,
        )}
      >
        <Ruler className="size-3.5" aria-hidden="true" />
        Size Chart
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bangle Size Chart</DialogTitle>
        </DialogHeader>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 text-center font-medium">Size</th>
              <th className="px-3 py-2 text-center font-medium">Dia (mm)</th>
              <th className="px-3 py-2 text-center font-medium">Fit</th>
            </tr>
          </thead>
          <tbody>
            {BANGLE_SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 text-center font-semibold text-gold-strong">
                  {row.size}
                  {row.popular ? (
                    <span className="ml-1 rounded bg-gold-strong px-1 py-0.5 text-[0.6rem] font-medium text-white align-middle">
                      Popular
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-center">{row.diameter}</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{row.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">
          Sizes 2.10 and above are made slightly larger and may carry a small extra charge.
        </p>
      </DialogContent>
    </Dialog>
  );
}
