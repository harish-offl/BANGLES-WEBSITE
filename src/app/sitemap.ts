import type { MetadataRoute } from "next";

import { getCatalog } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/collections", priority: 0.8, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/customize", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/shipping-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/returns-policy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const catalog = getCatalog();
    const categories = await catalog.listCategories({ activeOnly: true });

    for (const category of categories) {
      if ((category.product_count ?? 0) === 0) continue;
      entries.push({
        url: `${SITE_URL}/collections/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    let page = 1;
    let pageCount = 1;
    do {
      const products = await catalog.listProducts({ page, pageSize: 100, sort: "newest" });
      pageCount = products.pageCount;
      for (const product of products.items) {
        entries.push({
          url: `${SITE_URL}/products/${product.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      page += 1;
    } while (page <= pageCount);
  } catch {
    // Catalogue unavailable — still return the static routes.
  }

  return entries;
}
