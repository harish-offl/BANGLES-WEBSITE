"use client";

import { useState } from "react";

import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

/**
 * Product image viewer. Falls back to the neutral placeholder when a product
 * has no photography, and shows thumbnails only when there is more than one
 * image to choose from.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const list = images.filter((image) => Boolean(image.image_url));
  const current = list[active] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-brand-c100">
        <SmartImage
          src={current?.image_url ?? null}
          alt={current?.alt_text || name}
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 ? (
        <ul className="flex flex-wrap gap-3" aria-label={`${name} images`}>
          {list.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${list.length}`}
                aria-current={index === active}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border bg-brand-c100 transition-colors sm:size-20",
                  index === active ? "border-gold-strong" : "border-border hover:border-gold/60",
                )}
              >
                <SmartImage
                  src={image.image_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
