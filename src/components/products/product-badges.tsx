import { Badge } from "@/components/ui/badge";
import { getDiscount } from "@/lib/product-utils";

import type { Product } from "@/types";

interface ProductBadgesProps {
  product: Pick<Product, "price" | "compare_at_price" | "is_new_arrival" | "stock_quantity">;
  className?: string;
}

/** Stock, sale and newness flags. Out-of-stock always wins the slot. */
export function ProductBadges({ product, className }: ProductBadgesProps) {
  const { percent } = getDiscount(product);
  const soldOut = product.stock_quantity !== null && product.stock_quantity <= 0;

  return (
    <div className={className}>
      {soldOut ? (
        <Badge variant="secondary" className="bg-brand-ink text-white">
          Sold out
        </Badge>
      ) : percent !== null ? (
        <Badge className="bg-gold-strong text-white">{percent}% off</Badge>
      ) : product.is_new_arrival ? (
        <Badge variant="secondary" className="bg-brand-c200 text-brand-ink">
          New
        </Badge>
      ) : null}
    </div>
  );
}
