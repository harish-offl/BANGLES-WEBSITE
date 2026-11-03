"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

type ImageSource = ImageProps["src"];

interface SmartImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: ImageSource | null;
  alt: string;
  /** Letterbox the subject instead of cropping it (used for detail views). */
  contain?: boolean;
}

/**
 * `next/image` wrapper that swaps in the neutral catalogue placeholder when a
 * product has no photograph, so no layout ever renders a broken image.
 *
 * If an external image fails to load (404, 403, CORS, etc.) the component
 * falls back to the placeholder on the client so the page never shows a
 * broken-image icon.
 *
 * Local file paths (e.g. C:\Users\...\image.png) are rejected because
 * next/image requires a configured URL hostname. They fall back to the
 * placeholder instead of crashing.
 */
export function SmartImage({ src, alt, className, contain = false, ...props }: SmartImageProps) {
  const isLocalPath =
    typeof src === "string" &&
    (src.startsWith("\\\\") || /^[a-zA-Z]:[\\/]/.test(src));

  const [failed, setFailed] = useState(false);

  const resolved: ImageSource = src && !isLocalPath ? src : PLACEHOLDER_IMAGE;

  const handleError = () => {
    // Never retry on the placeholder itself to avoid infinite loops.
    if (resolved === PLACEHOLDER_IMAGE || failed) return;
    setFailed(true);
  };

  const finalSrc = failed ? PLACEHOLDER_IMAGE : resolved;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      className={cn(contain && "object-contain", className)}
      onError={handleError}
      {...props}
    />
  );
}
