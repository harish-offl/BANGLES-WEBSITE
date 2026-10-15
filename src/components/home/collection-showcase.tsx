import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

export interface ShowcaseGroup {
  category: Category;
  products: Product[];
  total: number;
}

interface CollectionShowcaseProps {
  groups: ShowcaseGroup[];
}

/** How many pieces of each collection are previewed on the home page. */
export const SHOWCASE_SIZE = 5;

/**
 * Home page showcase: a short row of pieces from each collection, followed by
 * a button that opens the full collection. Keeps the landing page light while
 * making every design one tap away.
 */
export function CollectionShowcase({ groups }: CollectionShowcaseProps) {
  const visible = groups.filter((group) => group.products.length > 0);
  if (visible.length === 0) return null;

  return (
    <section id="products" className="container-page scroll-mt-24 py-14 sm:py-20">
      <SectionHeading
        eyebrow="The collection"
        title={
          <>
            Every piece, <em>every detail</em>
          </>
        }
        description="A preview of each collection. Tap a piece for full details, or open the collection to see every design."
      />

      <div className="mt-10 space-y-16">
        {visible.map((group, groupIndex) => (
          <div
            key={group.category.id}
            id={`cat-${group.category.slug}`}
            className="scroll-mt-24"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <h3 className="font-display text-xl text-foreground sm:text-2xl">
                {group.category.name}
              </h3>
              <span className="text-xs text-muted-foreground">
                {group.total} item{group.total === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
              {group.products.map((product, index) => (
                <li key={product.id} className="flex">
                  <ProductCard
                    product={product}
                    priority={groupIndex === 0 && index === 0}
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="w-full"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-center">
              <Link
                href={`/collections/${group.category.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 gap-2 px-6",
                )}
              >
                View all {group.total} {group.category.name} items
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
