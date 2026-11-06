"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BANGLE_SIZES } from "@/lib/product-sizes";
import type { ColourImage, Product, ProductColour, ProductVariant } from "@/types";

interface ColourVariantFormProps {
  palette: ProductColour[];
  product?: Product;
}

function makeVariant(
  colour: string,
  hex: string,
  size: string,
  imageUrl: string | null,
): ProductVariant {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    product_id: "",
    variant_name: "Size",
    variant_value: size,
    size,
    colour,
    colour_hex: hex,
    image_url: imageUrl,
    sku: null,
    stock_quantity: null,
    // The storefront adds the standard size surcharge (2.10) on top of the
    // base price, so auto-created variants leave the override empty.
    price_override: null,
    is_active: true,
  };
}

// Synthetic ids only identify rows inside the form; the server ignores ids that
// are not already in the database and creates those rows.
export function ColourVariantForm({ palette, product }: ColourVariantFormProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(() =>
    (product?.variants ?? []).map((variant) => ({
      ...variant,
      size: variant.size ?? variant.variant_value,
    })),
  );
  const [selectedColours, setSelectedColours] = useState<string[]>(() => {
    const names = new Set<string>();
    for (const variant of product?.variants ?? []) {
      if (variant.colour) names.add(variant.colour);
    }
    for (const colour of product?.colours ?? []) names.add(colour);
    if (names.size === 0) {
      for (const colour of palette) {
        if (colour.is_active) names.add(colour.name);
      }
    }
    return [...names];
  });
  const [colourImages, setColourImages] = useState<ColourImage[]>(
    () => product?.colour_images ?? [],
  );

  const paletteByName = useMemo(() => {
    const map = new Map<string, ProductColour>();
    for (const colour of palette) map.set(colour.name.trim().toLowerCase(), colour);
    return map;
  }, [palette]);

  function colourMeta(name: string) {
    return paletteByName.get(name.trim().toLowerCase());
  }

  function addColour(name: string) {
    if (!name || selectedColours.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const meta = colourMeta(name);
    const hex = meta?.hex_code ?? "#C9A227";
    const imageUrl = meta?.image_url ?? null;
    setSelectedColours((prev) => [...prev, name]);
    setVariants((prev) => [
      ...prev,
      ...BANGLE_SIZES.map((size) =>
        makeVariant(name, hex, size.label, imageUrl),
      ),
    ]);
    if (imageUrl) {
      setColourImages((prev) => [
        ...prev.filter((img) => img.colour.toLowerCase() !== name.toLowerCase()),
        { colour: name, image_url: imageUrl },
      ]);
    }
  }

  function removeColour(name: string) {
    setSelectedColours((prev) => prev.filter((c) => c !== name));
    setVariants((prev) => prev.filter((variant) => variant.colour !== name));
    setColourImages((prev) => prev.filter((img) => img.colour !== name));
  }

  function addSize(colour: string) {
    const hex = colourMeta(colour)?.hex_code ?? "#C9A227";
    const used = new Set(
      variants
        .filter((variant) => variant.colour === colour)
        .map((variant) => (variant.size ?? variant.variant_value).toLowerCase()),
    );
    const next = BANGLE_SIZES.find((size) => !used.has(size.label.toLowerCase()));
    if (!next) return;
    setVariants((prev) => [
      ...prev,
      makeVariant(colour, hex, next.label, colourMeta(colour)?.image_url ?? null),
    ]);
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants((prev) =>
      prev.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant)),
    );
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((variant) => variant.id !== id));
  }

  function setImage(colour: string, imageUrl: string) {
    setColourImages((prev) => {
      const others = prev.filter(
        (img) => img.colour.toLowerCase() !== colour.toLowerCase(),
      );
      return imageUrl.trim()
        ? [...others, { colour, image_url: imageUrl.trim() }]
        : others;
    });
  }

  const availablePalette = palette.filter(
    (colour) =>
      colour.is_active &&
      !selectedColours.some(
        (selected) => selected.toLowerCase() === colour.name.toLowerCase(),
      ),
  );

  const submittedColours = useMemo(() => {
    // Include any variant colour that is not yet in the selected list so a
    // legacy row is never orphaned on save.
    const names = new Set(selectedColours);
    for (const variant of variants) {
      if (variant.colour) names.add(variant.colour);
    }
    return [...names];
  }, [selectedColours, variants]);

  const submittedImages = submittedColours
    .map((colourName) => {
      const explicit = colourImages.find(
        (img) => img.colour.toLowerCase() === colourName.toLowerCase(),
      );
      const url = explicit?.image_url.trim() || colourMeta(colourName)?.image_url || "";
      return url ? { colour: colourName, image_url: url } : null;
    })
    .filter((image): image is ColourImage => Boolean(image));

  return (
    <div className="space-y-4">
      <input type="hidden" name="colours" value={submittedColours.join(", ")} />
      <input
        type="hidden"
        name="variants_json"
        value={JSON.stringify(
          variants
            .filter((variant) => !variant.colour || submittedColours.includes(variant.colour))
            .map((variant) => ({
              id: variant.id.startsWith("new-") ? undefined : variant.id,
              variant_name: variant.variant_name,
              variant_value: variant.size ?? variant.variant_value,
              size: variant.size ?? variant.variant_value,
              colour: variant.colour ?? null,
              colour_hex: variant.colour_hex ?? null,
              image_url: variant.image_url ?? null,
              sku: variant.sku ?? null,
              stock_quantity: variant.stock_quantity,
              price_override: variant.price_override,
              is_active: variant.is_active,
            })),
        )}
      />
      <input
        type="hidden"
        name="colour_images_json"
        value={JSON.stringify(submittedImages)}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Colours &amp; sizes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick colours from the category palette. Each colour has its own size
            and stock rows, so shoppers only see sizes available in their colour.
            Leave stock blank when the colour is made to order.
          </p>
        </div>
      </div>

      {palette.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          This category has no colour palette yet. Add colours under Admin →
          Categories first.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {availablePalette.map((colour) => (
              <button
                key={colour.id}
                type="button"
                onClick={() => addColour(colour.name)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full border border-black/10"
                  style={{ backgroundColor: colour.hex_code }}
                />
                {colour.name}
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            ))}
            {availablePalette.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Every active palette colour is already used by this product.
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {selectedColours.map((colourName) => {
          const meta = colourMeta(colourName);
          const hex = meta?.hex_code ?? "#C9A227";
          const rows = variants.filter((variant) => variant.colour === colourName);
          const imageValue =
            colourImages.find(
              (img) => img.colour.toLowerCase() === colourName.toLowerCase(),
            )?.image_url ??
            meta?.image_url ??
            "";

          return (
            <section key={colourName} className="rounded-xl border border-border bg-card">
              <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <span
                  aria-hidden="true"
                  className="size-5 rounded-full border border-black/10"
                  style={{ backgroundColor: hex }}
                />
                <h3 className="font-display text-base font-semibold text-foreground">
                  {colourName}
                </h3>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSize(colourName)}
                    className="h-8 gap-1.5"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add size
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeColour(colourName)}
                    className="h-8 gap-1.5 text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove colour
                  </Button>
                </div>
              </header>

              <div className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`colour-image-${colourName}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Colour image (optional)
                  </label>
                  <Input
                    id={`colour-image-${colourName}`}
                    value={imageValue}
                    onChange={(event) => setImage(colourName, event.target.value)}
                    placeholder="/images/products/colors/forest-green.jpg"
                  />
                </div>

                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sizes yet. Add at least one size to sell this colour.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rows.map((variant) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        onUpdate={updateVariant}
                        onRemove={removeVariant}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {selectedColours.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No colours selected. Add a colour above to create its size rows.
        </p>
      ) : null}
    </div>
  );
}

interface VariantRowProps {
  variant: ProductVariant;
  onUpdate: (id: string, patch: Partial<ProductVariant>) => void;
  onRemove: (id: string) => void;
}

function VariantRow({ variant, onUpdate, onRemove }: VariantRowProps) {
  const size = variant.size ?? variant.variant_value;

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-background p-2.5 sm:grid-cols-[110px_1fr_1fr_auto_auto] sm:items-center">
      <div className="space-y-1">
        <label
          htmlFor={`size-${variant.id}`}
          className="text-[11px] font-medium text-muted-foreground sm:sr-only"
        >
          Size
        </label>
        <select
          id={`size-${variant.id}`}
          value={size}
          onChange={(event) =>
            onUpdate(variant.id, {
              size: event.target.value,
              variant_value: event.target.value,
            })
          }
          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {!BANGLE_SIZES.some((option) => option.label === size) ? (
            <option value={size}>{size}</option>
          ) : null}
          {BANGLE_SIZES.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
              {option.surcharge ? ` (+₹${option.surcharge})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`stock-${variant.id}`}
          className="text-[11px] font-medium text-muted-foreground sm:sr-only"
        >
          Stock
        </label>
        <Input
          id={`stock-${variant.id}`}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={variant.stock_quantity ?? ""}
          onChange={(event) =>
            onUpdate(variant.id, {
              stock_quantity: event.target.value === "" ? null : Number(event.target.value),
            })
          }
          placeholder="Untracked"
          className="h-9 tabular-nums"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`price-${variant.id}`}
          className="text-[11px] font-medium text-muted-foreground sm:sr-only"
        >
          Price override
        </label>
        <Input
          id={`price-${variant.id}`}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={variant.price_override ?? ""}
          onChange={(event) =>
            onUpdate(variant.id, {
              price_override: event.target.value === "" ? null : Number(event.target.value),
            })
          }
          placeholder="Base price"
          className="h-9 tabular-nums"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:pb-2">
        <input
          type="checkbox"
          checked={variant.is_active}
          onChange={(event) => onUpdate(variant.id, { is_active: event.target.checked })}
          className="size-4 rounded border-input accent-primary"
        />
        Active
      </label>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => onRemove(variant.id)}
        aria-label={`Remove size ${size}`}
        className="h-8 justify-self-start p-1.5 text-destructive hover:bg-destructive/5"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
