import type { CartLine } from "@/stores/cart-store";

import type { Product, ProductVariant } from "@/types";

interface ToCartLineOptions {
  quantity?: number;
  variant?: ProductVariant | null;
}

/**
 * Maps a catalogue product (and optional variant) onto a cart line.
 *
 * The unit price stored here is only a display convenience for the client —
 * `/api/order-enquiry` re-reads the catalogue and rebuilds the enquiry from
 * server-side prices before anything is sent to WhatsApp.
 */
export function toCartLine(product: Product, options: ToCartLineOptions = {}): CartLine {
  const { quantity = 1, variant = null } = options;
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.primary_image_url ?? null,
    sku: variant?.sku ?? product.sku ?? null,
    unitPrice: variant?.price_override ?? product.price,
    variantId: variant?.id ?? null,
    variantLabel: variant ? `${variant.variant_name}: ${variant.variant_value}` : null,
    quantity: Math.max(1, quantity),
  };
}
