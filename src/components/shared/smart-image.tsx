import Image, { type ImageProps } from "next/image";

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
 * Local file paths (e.g. C:\Users\...\image.png) are rejected because
 * next/image requires a configured URL hostname. They fall back to the
 * placeholder instead of crashing.
 */
export function SmartImage({ src, alt, className, contain = false, ...props }: SmartImageProps) {
  const isLocalPath =
    typeof src === "string" &&
    (src.startsWith("\\\\") || /^[a-zA-Z]:[\\/]/.test(src));

  const resolved: ImageSource = src && !isLocalPath ? src : PLACEHOLDER_IMAGE;
  return (
    <Image
      src={resolved}
      alt={alt}
      className={cn(contain && "object-contain", className)}
      {...props}
    />
  );
}
