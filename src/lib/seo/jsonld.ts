import { SITE_URL } from "@/lib/site";
import { getPurchaseState } from "@/lib/product-utils";
import type { Crumb } from "@/components/shared/breadcrumbs";
import type { Product } from "@/types";

/**
 * Structured-data builders. These are pure so both server components and route
 * handlers can use them, and they emit only facts actually stored in the
 * catalogue (no invented ratings or review counts).
 */

const SCHEMA_AVAILABILITY: Record<string, string> = {
  in: "https://schema.org/InStock",
  out: "https://schema.org/OutOfStock",
};

export function productJsonLd(product: Product) {
  const purchase = getPurchaseState(product);
  const images = (product.images ?? [])
    .map((image) => image.image_url)
    .filter(Boolean)
    .map((url) => (url.startsWith("http") ? url : `${SITE_URL}${url}`));

  if (product.primary_image_url && images.length === 0) {
    images.push(
      product.primary_image_url.startsWith("http")
        ? product.primary_image_url
        : `${SITE_URL}${product.primary_image_url}`,
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(images.length ? { image: images } : {}),
    ...(product.category_name ? { category: product.category_name } : {}),
    ...(product.colours.length ? { color: product.colours.join(", ") } : {}),
    brand: { "@type": "Brand", name: "Bangles by Beauty" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      price: product.price,
      priceCurrency: "INR",
      availability: purchase.available ? SCHEMA_AVAILABILITY.in : SCHEMA_AVAILABILITY.out,
    },
  };
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function itemListJsonLd(name: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/products/${product.slug}`,
      ...(product.primary_image_url
        ? {
            image: product.primary_image_url.startsWith("http")
              ? product.primary_image_url
              : `${SITE_URL}${product.primary_image_url}`,
          }
        : {}),
    })),
  };
}
