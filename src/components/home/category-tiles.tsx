import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

import type { Category } from "@/types";

interface CategoryTilesProps {
  categories: Category[];
  limit?: number;
}

/** "Shop by collection" — one tile per active category with its product count. */
export function CategoryTiles({ categories, limit = 8 }: CategoryTilesProps) {
  const visible = categories.filter((c) => c.is_active).slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <section id="collections" className="container-page scroll-mt-24 py-14 sm:py-20">
      <SectionHeading
        eyebrow="Collections"
        title={
          <>
            Shop by <em>collection</em>
          </>
        }
        description="From intricate border bangles to full bridal sets — explore the collection that suits your occasion."
        action={
          <Link
            href="#products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-strong transition-colors hover:text-foreground"
          >
            View all products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((category, index) => (
          <li key={category.id} className={cn(index === 0 && "col-span-2 sm:col-span-1")}>
            <Link
              href={`#cat-${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-brand-c100"
            >
              <SmartImage
                src={category.image_url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/20 to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <span className="font-display text-base leading-tight text-white sm:text-lg">
                  {category.name}
                </span>
                {typeof category.product_count === "number" ? (
                  <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] text-white backdrop-blur">
                    {category.product_count}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
