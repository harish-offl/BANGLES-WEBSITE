"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";

import { useIsWishlisted, useWishlistActions } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface WishlistButtonProps {
  product: Pick<Product, "id" | "slug" | "name" | "primary_image_url" | "price">;
  className?: string;
  /** Renders the button with a visible text label (product page). */
  withLabel?: boolean;
}

/**
 * Toggles a product in the browser-only saved list. Rendered over product
 * imagery and on product pages. Hydration-safe: reports "not saved" until the
 * persisted list is read.
 */
export function WishlistButton({ product, className, withLabel = false }: WishlistButtonProps) {
  const saved = useIsWishlisted(product.id);
  const { toggle } = useWishlistActions();

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggle({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.primary_image_url ?? null,
      price: product.price,
      addedAt: Date.now(),
    });
    toast.success(saved ? "Removed from saved" : "Saved for later", {
      description: product.name,
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name} for later`}
      className={cn(
        withLabel
          ? "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
          : "grid size-9 place-items-center rounded-full border border-border bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-brand-c100",
        className,
      )}
    >
      <Heart
        className={cn("size-4 transition-colors", saved && "fill-gold-strong text-gold-strong")}
        aria-hidden="true"
      />
      {withLabel ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
