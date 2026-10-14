"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart";
import { toCartLine } from "@/lib/cart/line";
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
}: AddToCartButtonProps) {
  const { add } = useCartActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  const purchase = getPurchaseState(product);
  const variantUnavailable = variant ? variant.stock_quantity === 0 : false;
  const disabled = !purchase.available || variantUnavailable || pending;

  function handleAdd() {
    if (disabled) return;
    setPending(true);
    add(toCartLine(product, { quantity, variant }));
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
      aria-label={disabled ? (purchase.reason ?? "Unavailable") : `${label}: ${product.name}`}
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
        {!purchase.available ? (purchase.reason ?? "Unavailable") : added ? "Added" : label}
      </span>
    </Button>
  );
}
