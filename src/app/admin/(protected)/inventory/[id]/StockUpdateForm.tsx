"use client";

import { useActionState, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  deleteProductVariantAction,
  updateVariantStockAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";

function toQuantities(variants: ProductVariant[]): Record<string, number> {
  return variants.reduce(
    (acc, v) => ({ ...acc, [v.id]: v.stock_quantity ?? 0 }),
    {} as Record<string, number>,
  );
}

export default function StockUpdateForm({
  product,
  variants,
}: {
  product: { id: string; name: string };
  variants: ProductVariant[];
}) {
  const [, formAction, isPending] = useActionState(
    updateVariantStockAction,
    { status: "idle" },
  );
  const [quantities, setQuantities] = useState(() =>
    toQuantities(variants),
  );
  const [syncedVariants, setSyncedVariants] = useState(variants);

  if (variants !== syncedVariants) {
    setSyncedVariants(variants);
    setQuantities(toQuantities(variants));
  }

  const hasChanges = variants.some((v) => quantities[v.id] !== (v.stock_quantity ?? 0));
  const totalStock = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  if (variants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Size-wise stock
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No sizes added yet. Add the first bangle size and its stock below.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="productId" value={product.id} />

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Size-wise stock
          </h3>
          <p className="text-xs text-muted-foreground">
            {variants.length} size{variants.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Update stock for each product size. Changes are saved per variant.
        </p>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium text-right">Current stock</th>
                <th className="px-4 py-3 font-medium text-right">New stock</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
                <th className="px-4 py-3 text-right font-medium">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((variant) => {
                const currentQty = variant.stock_quantity ?? 0;
                const newQty = quantities[variant.id] ?? currentQty;
                const isOut = newQty === 0;
                const isLow = newQty > 0 && newQty <= 5;
                return (
                  <tr key={variant.id} className="last:border-0">
                    <td className="px-4 py-3 text-sm tabular-nums text-foreground">
                      {variant.variant_value}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">
                      {currentQty}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        id={`variant_${variant.id}`}
                        name={`variant_${variant.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={newQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (Number.isInteger(val) && val >= 0) {
                            setQuantities((prev) => ({ ...prev, [variant.id]: val }));
                          }
                        }}
                        className="w-20 h-9 rounded-lg border border-input px-3 text-sm tabular-nums text-right outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          isOut
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : isLow
                            ? "bg-warning/10 text-warning-foreground border border-warning/20"
                            : "bg-brand-c100 text-brand-ink border border-brand-c300",
                        )}
                      >
                        {isOut ? "Out of stock" : isLow ? "Low stock" : "In stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="submit"
                        formAction={deleteProductVariantAction}
                        name="variantId"
                        value={variant.id}
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-destructive hover:bg-destructive/5"
                        onClick={(event) => {
                          if (
                            !window.confirm(
                              `Remove size ${variant.variant_value}? This cannot be undone.`,
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-medium bg-brand-c50">
                <td className="px-4 py-3 text-right" colSpan={2}>
                  Total stock
                </td>
                <td className="px-4 py-3 tabular-nums text-right font-semibold">
                  {totalStock}
                </td>
                <td className="px-4 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuantities(toQuantities(variants));
            }}
            disabled={isPending || !hasChanges}
            className="h-10"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="h-10 bg-gold text-base text-gold-foreground hover:bg-gold/90"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save stock changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
