"use client";

import { useState } from "react";

import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
  /**
   * Optional controlled image. When provided (e.g. after a shopper picks a
   * colour), it takes precedence over the internally tracked index.
   */
  selectedImageUrl?: string | null;
  /** Called when a thumbnail is clicked, so the parent can sync colour state. */
  onSelectImage?: (url: string) => void;
}

/**
 * Product image viewer. Falls back to the neutral placeholder when a product
 * has no photography, and shows thumbnails only when there is more than one
 * image to choose from.
 */
export function ProductGallery({
  images,
  name,
  selectedImageUrl,
  onSelectImage,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const list = images.filter((image) => Boolean(image.image_url));
  const controlledIndex = selectedImageUrl
    ? list.findIndex((image) => image.image_url === selectedImageUrl)
    : -1;
  const index = controlledIndex >= 0 ? controlledIndex : active;
  const current = list[index] ?? null;

  function select(i: number) {
    const url = list[i]?.image_url;
    if (onSelectImage && url) {
      onSelectImage(url);
    } else {
      setActive(i);
    }
  }

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
          {list.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => select(i)}
                aria-label={`Show image ${i + 1} of ${list.length}`}
                aria-current={i === index}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border bg-brand-c100 transition-colors sm:size-20",
                  i === index ? "border-gold-strong" : "border-border hover:border-gold/60",
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
