import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/site";
import { getDiscount } from "@/lib/product-utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders the selling price and, only when a genuine was-price exists, the
 * struck-through original. No discount is ever invented.
 */
export function Price({
  price,
  compareAtPrice = null,
  currency = "INR",
  size = "md",
  className,
}: PriceProps) {
  const { savings } = getDiscount({ price, compare_at_price: compareAtPrice ?? null });

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-medium text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-xl sm:text-2xl",
        )}
      >
        {formatPrice(price, currency)}
      </span>
      {savings !== null ? (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "lg" ? "text-sm" : "text-xs",
          )}
        >
          {formatPrice(compareAtPrice as number, currency)}
        </span>
      ) : null}
    </span>
  );
}
