"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { addProductVariantsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/admin/action-state";
import { BANGLE_SIZES } from "@/lib/product-sizes";

const initialState: ActionState = { status: "idle" };

export default function AddSizeForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    addProductVariantsAction,
    initialState,
  );
  const [rows, setRows] = useState<number[]>([1]);
  const nextRowId = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  function addRow() {
    setRows((prev) => [...prev, nextRowId.current]);
    nextRowId.current += 1;
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row !== id) : prev));
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-card p-5"
    >
      <input type="hidden" name="productId" value={productId} />

      <h3 className="font-display text-lg font-semibold text-foreground">
        Add sizes
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add one or more bangle sizes with their opening stock. Sizes are stored
        as text, so 2.10 stays 2.10.
      </p>

      <datalist id="bangle-size-options">
        {BANGLE_SIZES.map((size) => (
          <option key={size.label} value={size.label} />
        ))}
      </datalist>

      <div className="mt-4 space-y-3">
        {rows.map((rowId, index) => (
          <div
            key={rowId}
            className="grid gap-3 border-t border-border pt-3 first:border-0 first:pt-0 sm:grid-cols-2 lg:grid-cols-[1fr_140px_1fr_auto] lg:items-end"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor={`size-${rowId}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Size
              </Label>
              <Input
                id={`size-${rowId}`}
                name="size"
                list="bangle-size-options"
                placeholder="e.g. 2.6"
                required
              />
              {fieldErrors?.[`size_${index}`] ? (
                <p className="text-xs text-destructive">
                  {fieldErrors[`size_${index}`]}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`stock-${rowId}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Initial stock
              </Label>
              <Input
                id={`stock-${rowId}`}
                name="stock"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                aria-label="Initial stock"
              />
              {fieldErrors?.[`stock_${index}`] ? (
                <p className="text-xs text-destructive">
                  {fieldErrors[`stock_${index}`]}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`sku-${rowId}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Variant SKU (optional)
              </Label>
              <Input
                id={`sku-${rowId}`}
                name="sku"
                placeholder="e.g. BNG-108-26"
                aria-label="Variant SKU (optional)"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRow(rowId)}
              disabled={rows.length === 1}
              className="h-9 gap-1.5 text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="h-9 gap-2"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add another size
        </Button>
        <Button type="submit" disabled={pending} className="h-9 gap-2">
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Save sizes
        </Button>
      </div>

      {state.status === "success" ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-foreground"
        >
          {state.message}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
