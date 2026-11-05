"use client";

import { useState } from "react";
import { Minus, Plus, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/products/price";
import { SizeChart } from "@/components/products/size-chart";
import { WishlistButton } from "@/components/products/wishlist-button";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart";
import { toCartLine } from "@/lib/cart/line";
import {
  BANGLE_SIZES,
  DEFAULT_BANGLE_SIZE,
  getSizeSurcharge,
  isBangleCategory,
  isGlassBanglesCategory,
} from "@/lib/product-sizes";
import { getPurchaseState, getStockLabel } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/shared";
import type { Product, ProductVariant } from "@/types";

interface ProductPurchasePanelProps {
  product: Product;
  whatsappNumber: string | null;
  siteUrl: string;
  /** Currently selected colour, owned by the parent so the gallery can follow. */
  colour: string | null;
  onColourChange: (colour: string) => void;
}

interface SizeOption {
  id: string;
  label: string;
  stock: number | null;
  priceOverride: number | null;
  variant: ProductVariant | null;
}

const MAX_QUANTITY = 99;

/**
 * Product-page buy box: size and colour choice, quantity, add-to-bag and a
 * WhatsApp enquiry shortcut. When a product has variants, each size uses its
 * own stock count and price override; otherwise the shared bangle sizes are
 * offered without per-size tracking.
 */
export function ProductPurchasePanel({
  product,
  whatsappNumber,
  siteUrl,
  colour,
  onColourChange,
}: ProductPurchasePanelProps) {
  const { add } = useCartActions();
  const [added, setAdded] = useState(false);

  const purchase = getPurchaseState(product);
  const stockLabel = getStockLabel(product);

  const showSizes = isBangleCategory(product.category_name);

  const variants = (product.variants ?? []).filter((variant) => variant.is_active);
  const sizeOptions: SizeOption[] =
    showSizes && variants.length > 0
      ? variants.map((variant) => ({
          id: variant.id,
          label: variant.variant_value,
          stock: variant.stock_quantity,
          priceOverride: variant.price_override,
          variant,
        }))
      : showSizes
        ? BANGLE_SIZES.map((option) => ({
            id: `size-${option.label}`,
            label: option.label,
            stock: null,
            priceOverride: option.surcharge > 0 ? option.surcharge : null,
            variant: null,
          }))
        : [];

  const [size, setSize] = useState<string | null>(() => {
    if (sizeOptions.some((option) => option.label === DEFAULT_BANGLE_SIZE)) {
      return DEFAULT_BANGLE_SIZE;
    }
    return sizeOptions[0]?.label ?? null;
  });
  const [quantity, setQuantity] = useState(1);

  const selectedOption = sizeOptions.find((option) => option.label === size) ?? null;
  const selectedVariant = selectedOption?.variant ?? null;
  const variantStock = selectedOption?.stock ?? null;

  const sizeSurcharge = showSizes ? getSizeSurcharge(size) : 0;
  const unitPrice = (selectedVariant?.price_override ?? product.price) + sizeSurcharge;

  const isOutOfStock = variantStock === 0;
  const isLowStock = variantStock !== null && variantStock > 0 && variantStock <= 5;
  const canAdd =
    purchase.available &&
    !isOutOfStock &&
    (variantStock === null || quantity <= variantStock);

  function handleAdd() {
    if (!canAdd) return;
    add(
      toCartLine(product, {
        quantity,
        variant: selectedVariant,
        size: showSizes ? size : null,
        colour,
      }),
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    toast.success("Added to bag", { description: product.name });
  }

  function handleEnquire() {
    const details = [
      showSizes && size ? `Size: ${size}` : null,
      colour ? `Colour: ${colour}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    const message = buildWhatsAppMessage({
      storeName: "Bangles by Beauty",
      siteUrl,
      closing: [
        details ? `Preferred ${details}.` : null,
        "Please confirm availability, price and delivery.",
      ]
        .filter(Boolean)
        .join(" "),
      items: [
        {
          name: product.name,
          quantity,
          unitPrice,
          sku: selectedVariant?.sku ?? product.sku,
          size: showSizes ? size : null,
          colour,
          url: `${siteUrl}/products/${product.slug}`,
        },
      ],
    });
    const url = buildWhatsAppUrl(whatsappNumber, message);
    if (!url) {
      toast.error("WhatsApp ordering is not configured yet.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const canEnquire = Boolean(whatsappNumber);
  const colours = product.colours ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Price price={unitPrice} compareAtPrice={product.compare_at_price} size="lg" />
        {stockLabel ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs",
              purchase.available
                ? "bg-brand-c100 text-gold-strong"
                : "bg-brand-ink text-white",
            )}
          >
            {stockLabel}
          </span>
        ) : null}
        {showSizes && isOutOfStock ? (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">
            This size is out of stock
          </span>
        ) : null}
        {showSizes && isLowStock ? (
          <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs text-warning-foreground">
            Only {variantStock} left in this size
          </span>
        ) : null}
      </div>

      {product.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      ) : null}

      {showSizes ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Select Size
            </p>
            <SizeChart />
          </div>
          <ul className="flex flex-wrap gap-2">
            {sizeOptions.map((option) => {
              const selected = option.label === size;
              const isOut = option.stock === 0;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={
                      isOut
                        ? undefined
                        : () => {
                            setSize(option.label);
                            setQuantity(1);
                          }
                    }
                    aria-pressed={selected}
                    aria-disabled={isOut}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm tabular-nums transition-colors",
                      isOut
                        ? "cursor-not-allowed border-destructive/30 bg-destructive/5 text-destructive"
                        : selected
                          ? "border-gold-strong bg-brand-c100 font-medium text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-gold/60 hover:text-foreground",
                    )}
                  >
                    {option.label}
                    {option.stock === 0 ? (
                      <span className="text-xs text-destructive">Out</span>
                    ) : option.stock !== null && option.stock <= 5 ? (
                      <span className="text-xs text-warning-foreground">
                        {option.stock} left
                      </span>
                    ) : null}
                    {option.priceOverride && option.priceOverride > 0 ? (
                      <span className="text-xs text-gold-strong">
                        +₹{option.priceOverride}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 min-h-4 text-xs text-muted-foreground">
            {sizeSurcharge > 0
              ? `Base ₹${product.price.toLocaleString("en-IN")} + size ₹${sizeSurcharge.toLocaleString(
                  "en-IN",
                )}`
              : null}
          </p>
        </div>
      ) : null}

      {isGlassBanglesCategory(product.category_name) && colours.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Colour
          </p>
          <ul className="flex flex-wrap gap-2">
            {colours.map((option) => {
              const selected = option === colour;
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => onColourChange(option)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors",
                      selected
                        ? "border-gold-strong bg-brand-c100 font-medium text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-gold/60 hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Quantity
          </p>
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !canAdd}
              aria-label="Decrease quantity"
              className="grid size-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span
              className="w-10 text-center text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) =>
                  Math.min(variantStock ?? MAX_QUANTITY, MAX_QUANTITY, q + 1),
                )
              }
              disabled={
                quantity >= (variantStock ?? MAX_QUANTITY) || !canAdd
              }
              aria-label="Increase quantity"
              className="grid size-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={!canAdd}
          className="h-12 min-w-44 flex-1 gap-2"
        >
          {added ? <Check className="size-4" aria-hidden="true" /> : <ShoppingBag className="size-4" aria-hidden="true" />}
          {!purchase.available
            ? (purchase.reason ?? "Unavailable")
            : isOutOfStock
              ? "Out of stock"
              : added
                ? "Added"
                : "Add to bag"}
        </Button>
        <WishlistButton product={product} withLabel className="h-12" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleEnquire}
        disabled={!canEnquire}
        className="h-12 w-full gap-2 border-gold/60 text-gold-strong hover:bg-brand-c100"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {canEnquire ? "Enquire on WhatsApp" : "WhatsApp unavailable"}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Payment collected online via Razorpay — Google Pay, PhonePe, Paytm,
        UPI, debit cards and credit cards accepted. 100% secure checkout.
      </p>
    </div>
  );
}
