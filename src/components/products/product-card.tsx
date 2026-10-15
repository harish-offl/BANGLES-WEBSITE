import Link from "next/link";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Price } from "@/components/products/price";
import { ProductBadges } from "@/components/products/product-badges";
import { WishlistButton } from "@/components/products/wishlist-button";
import { SmartImage } from "@/components/shared/smart-image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** `sizes` hint passed to the image; tuned per grid. */
  sizes?: string;
  /** Set on the first row of above-the-fold grids. */
  priority?: boolean;
}

/**
 * Catalogue card shared by the shop, collection, search, wishlist and
 * "you may also like" grids. The image and title link to the product detail
 * page; adding to the bag and saving happen inline via client children.
 */
export function ProductCard({
  product,
  className,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw",
  priority = false,
}: ProductCardProps) {
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-[var(--shadow-hover)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-brand-c100">
        <Link href={href} aria-label={product.name} className="block h-full w-full">
          <SmartImage
            src={product.primary_image_url}
            alt={product.name}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>
        <ProductBadges product={product} className="absolute left-3 top-3 flex flex-col gap-1" />
        <WishlistButton product={product} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-base leading-snug text-foreground">
            <Link href={href} className="transition-colors hover:text-gold-strong">
              {product.name}
            </Link>
          </h3>
          {product.category_name ? (
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
              {product.category_name}
            </p>
          ) : null}
        </div>

        {product.colours.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Available colours">
            {product.colours.slice(0, 4).map((colour) => (
              <li key={colour}>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-paper px-2 py-0.5 text-[0.65rem] font-normal capitalize text-muted-foreground"
                >
                  {colour}
                </Badge>
              </li>
            ))}
            {product.colours.length > 4 ? (
              <li className="self-center text-[0.65rem] text-muted-foreground">
                +{product.colours.length - 4}
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-end justify-between gap-3">
            <Price price={product.price} compareAtPrice={product.compare_at_price} size="md" />
            {product.sku ? (
              <span className="text-[0.7rem] text-muted-foreground">Code {product.sku}</span>
            ) : null}
          </div>
          <AddToCartButton product={product} compact className="h-10 w-full" label="Add to bag" />
        </div>
      </div>
    </article>
  );
}
