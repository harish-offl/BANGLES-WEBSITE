"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductVariant } from "@/types";

interface VariantListFormProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantListForm({ variants, onChange }: VariantListFormProps) {
  const [variantsState, setVariantsState] = useState<ProductVariant[]>(
    variants.map((v) => ({ ...v })),
  );

  useEffect(() => {
    onChange(variantsState);
  }, [variantsState, onChange]);

  const addVariant = () => {
    setVariantsState([
      ...variantsState,
      {
        id: `new-${Date.now()}`,
        product_id: "",
        variant_name: "Size",
        variant_value: "",
        sku: null,
        stock_quantity: 0,
        price_override: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariantsState(variantsState.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariantsState((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    );
  };

  return (
    <div className="space-y-3">
      {variantsState.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          No size variants defined. Click &quot;Add size&quot; to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {variantsState.map((variant) => (
            <VariantRow
              key={variant.id}
              variant={variant}
              onUpdate={updateVariant}
              onRemove={removeVariant}
            />
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariant}
          className="h-9"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add size
        </Button>
      </div>
    </div>
  );
}

interface VariantRowProps {
  variant: ProductVariant;
  onUpdate: (id: string, updates: Partial<ProductVariant>) => void;
  onRemove: (id: string) => void;
}

function VariantRow({
  variant,
  onUpdate,
  onRemove,
}: VariantRowProps) {
  const [stock, setStock] = useState(variant.stock_quantity ?? 0);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-medium text-foreground">
          {variant.variant_value}
        </span>
        <input
          type="hidden"
          name={`variant_${variant.id}`}
          value={stock}
        />
        <input type="hidden" name={`variant_id_${variant.id}`} value={variant.id} />
      </div>
      <div className="flex-1">
        <Input
          id={`stock_${variant.id}`}
          name={`stock_${variant.id}`}
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!Number.isNaN(val) && val >= 0) {
              setStock(val);
              onUpdate(variant.id, { stock_quantity: val });
            }
          }}
          className="w-20 h-9 rounded-lg border border-input px-3 text-sm tabular-nums text-right outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onRemove(variant.id)}
          aria-label={`Remove size ${variant.variant_value}`}
          className="h-8 p-1.5 text-destructive hover:bg-destructive/5"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
