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
 */
export function SmartImage({ src, alt, className, contain = false, ...props }: SmartImageProps) {
  const resolved: ImageSource = src ?? PLACEHOLDER_IMAGE;
  return (
    <Image
      src={resolved}
      alt={alt}
      className={cn(contain && "object-contain", className)}
      {...props}
    />
  );
}
