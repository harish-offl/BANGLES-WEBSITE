"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductColour } from "@/types";

interface ColourPaletteFormProps {
  colours: ProductColour[];
  onChange: (colours: ProductColour[]) => void;
}

/**
 * Category-level palette editor. Products in the category choose from these
 * entries, so a new colourway is added once instead of duplicating products.
 */
export function ColourPaletteForm({ colours, onChange }: ColourPaletteFormProps) {
  function update(index: number, patch: Partial<ProductColour>) {
    onChange(colours.map((colour, i) => (i === index ? { ...colour, ...patch } : colour)));
  }

  function remove(index: number) {
    onChange(colours.filter((_, i) => i !== index));
  }

  function add() {
    onChange([
      ...colours,
      {
        id: `new-${Date.now()}`,
        category_id: "",
        name: "",
        hex_code: "#C9A227",
        image_url: null,
        is_active: true,
        sort_order: colours.length,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Colour palette</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the colours offered in this category (for example Glass Bangles).
            Each product picks from this palette, and every colour gets its own size
            and stock rows.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-9 gap-2">
          <Plus className="size-3.5" aria-hidden="true" />
          Add colour
        </Button>
      </div>

      {colours.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No colours defined yet. Add the first colour to build the palette.
        </p>
      ) : (
        <div className="space-y-2">
          {colours.map((colour, index) => (
            <div
              key={colour.id}
              className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_110px_1fr_auto] sm:items-end"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor={`colour-name-${colour.id}`}
                  className={index === 0 ? "text-xs font-medium text-muted-foreground" : "sr-only"}
                >
                  Colour name
                </label>
                <Input
                  id={`colour-name-${colour.id}`}
                  value={colour.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                  placeholder="Forest Green"
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`colour-hex-${colour.id}`}
                  className={index === 0 ? "text-xs font-medium text-muted-foreground" : "sr-only"}
                >
                  Swatch
                </label>
                <input
                  id={`colour-hex-${colour.id}`}
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(colour.hex_code) ? colour.hex_code : "#C9A227"}
                  onChange={(event) => update(index, { hex_code: event.target.value })}
                  className="h-9 w-full cursor-pointer rounded-lg border border-input bg-background p-1"
                  aria-label={`Swatch colour for ${colour.name || "colour"}`}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`colour-image-${colour.id}`}
                  className={index === 0 ? "text-xs font-medium text-muted-foreground" : "sr-only"}
                >
                  Colour image URL (optional)
                </label>
                <Input
                  id={`colour-image-${colour.id}`}
                  value={colour.image_url ?? ""}
                  onChange={(event) =>
                    update(index, { image_url: event.target.value.trim() || null })
                  }
                  placeholder="/images/products/colors/forest-green.jpg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="h-9 gap-1.5 text-destructive hover:bg-destructive/5"
                aria-label={`Remove ${colour.name || "colour"}`}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
