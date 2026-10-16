"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart";
import { toCartLine } from "@/lib/cart/line";
import { isBangleCategory } from "@/lib/product-sizes";
import { getPurchaseState } from "@/lib/product-utils";
import { cn } from "@/lib/utils";

import type { Product, ProductVariant } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant | null;
  quantity?: number;
  size?: "sm" | "lg" | "default";
  variant_?: "default" | "outline";
  className?: string;
  label?: string;
  /** Renders a compact icon + text treatment suited to product cards. */
  compact?: boolean;
  /** Sends the shopper to the bag after adding (used on the product page). */
  goToCart?: boolean;
  /**
   * Explicit bangle size for this line. Optional: when a bangle is added from a
   * grid without one, the button routes to the detail page so a size is chosen
   * rather than silently defaulting.
   */
  bangleSize?: string;
  /** Selected colour option, when the caller already knows it. */
  colour?: string;
}

export function AddToCartButton({
  product,
  variant = null,
  quantity = 1,
  size = "default",
  variant_ = "default",
  className,
  label = "Add to bag",
  compact = false,
  goToCart = false,
  bangleSize,
  colour,
}: AddToCartButtonProps) {
  const { add } = useCartActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  const purchase = getPurchaseState(product);
  const variantUnavailable = variant ? variant.stock_quantity === 0 : false;
  const disabled = !purchase.available || variantUnavailable || pending;

  // Bangles are sized per order, so a quick add without a chosen size must send
  // the shopper to the detail page instead of creating a sizeless bag line.
  const needsSize = isBangleCategory(product.category_name) && !bangleSize;
  const displayLabel = needsSize ? "Select size" : label;

  function handleAdd() {
    if (disabled) return;

    if (needsSize) {
      router.push(`/products/${product.slug}`);
      return;
    }

    setPending(true);
    add(toCartLine(product, { quantity, variant, size: bangleSize, colour }));
    setPending(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);

    toast.success("Added to bag", {
      description: product.name,
      action: { label: "View bag", onClick: () => router.push("/cart") },
    });

    if (goToCart) router.push("/cart");
  }

  return (
    <Button
      type="button"
      variant={variant_}
      size={size}
      onClick={handleAdd}
      disabled={disabled}
      aria-label={
        disabled
          ? (purchase.reason ?? "Unavailable")
          : needsSize
            ? `Select a size for ${product.name}`
            : `${displayLabel}: ${product.name}`
      }
      className={cn("gap-2", className)}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : added ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-4" aria-hidden="true" />
      )}
      <span className={cn(compact && "hidden sm:inline")}>
        {!purchase.available ? (purchase.reason ?? "Unavailable") : added ? "Added" : displayLabel}
      </span>
    </Button>
  );
}
