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
} from "@/lib/product-sizes";
import { getPurchaseState, getStockLabel } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/shared";
import type { Product } from "@/types";

interface ProductPurchasePanelProps {
  product: Product;
  whatsappNumber: string | null;
  siteUrl: string;
  /** Currently selected colour, owned by the parent so the gallery can follow. */
  colour: string | null;
  onColourChange: (colour: string) => void;
}

const MAX_QUANTITY = 99;

/**
 * Product-page buy box: size and colour choice, quantity, add-to-bag and a
 * WhatsApp enquiry shortcut. The shop takes no online payment — the enquiry
 * hands the selection to the studio, which confirms price and delivery in chat.
 */
export function ProductPurchasePanel({
  product,
  whatsappNumber,
  siteUrl,
  colour,
  onColourChange,
}: ProductPurchasePanelProps) {
  const { add } = useCartActions();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(DEFAULT_BANGLE_SIZE);
  const [added, setAdded] = useState(false);

  const purchase = getPurchaseState(product);
  const stockLabel = getStockLabel(product);

  const showSizes = isBangleCategory(product.category_name);
  const sizeSurcharge = showSizes ? getSizeSurcharge(size) : 0;
  const unitPrice = product.price + sizeSurcharge;

  function handleAdd() {
    if (!purchase.available) return;
    add(toCartLine(product, { quantity, size: showSizes ? size : null, colour }));
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
          sku: product.sku,
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
      </div>

      {showSizes ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Select Size
            </p>
            <SizeChart />
          </div>
          <ul className="flex flex-wrap gap-2">
            {BANGLE_SIZES.map((option) => {
              const selected = option.label === size;
              return (
                <li key={option.label}>
                  <button
                    type="button"
                    onClick={() => setSize(option.label)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-sm tabular-nums transition-colors",
                      selected
                        ? "border-gold-strong bg-brand-c100 font-medium text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-gold/60 hover:text-foreground",
                    )}
                  >
                    {option.label}
                    {option.surcharge > 0 ? (
                      <span className="ml-1.5 text-xs text-gold-strong">
                        +₹{option.surcharge}
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

      {product.colours.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Colour
          </p>
          <ul className="flex flex-wrap gap-2">
            {product.colours.map((option) => {
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
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid size-10 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
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
              onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
              className="grid size-10 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
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
          disabled={!purchase.available}
          className="h-12 min-w-44 flex-1 gap-2"
        >
          {added ? <Check className="size-4" aria-hidden="true" /> : <ShoppingBag className="size-4" aria-hidden="true" />}
          {!purchase.available ? (purchase.reason ?? "Unavailable") : added ? "Added" : "Add to bag"}
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
        No payment is taken online. Tap “Enquire on WhatsApp” to confirm availability,
        delivery and payment with our studio.
      </p>
    </div>
  );
}
