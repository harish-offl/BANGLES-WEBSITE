import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin/access";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import catalog from "@/lib/data/catalog.json";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

interface CatalogProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  primary_image_url: string | null;
  colours: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  seo_title: string | null;
  seo_description: string | null;
  legacy_id: string | null;
  legacy_image_source: string | null;
  sort_index: number;
}

export async function POST() {
  try {
    await requireAdminAccess();
  } catch {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const supabase = getServiceRoleClient();
  const now = new Date().toISOString();

  const categories = catalog.categories as CatalogCategory[];
  const products = catalog.products as CatalogProduct[];

  // Insert categories first (upsert by id)
  const categoryRows = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
    image_url: cat.image_url,
    sort_order: cat.sort_order,
    is_active: cat.is_active,
    updated_at: now,
  }));

  const { error: catError } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "id" });

  if (catError) {
    return NextResponse.json(
      { error: `Failed to import categories: ${catError.message}` },
      { status: 500 },
    );
  }

  // Insert products (upsert by id)
  const productRows = products.map((p) => ({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    sku: p.sku,
    price: p.price,
    compare_at_price: p.compare_at_price,
    stock_quantity: p.stock_quantity,
    primary_image_url: p.primary_image_url,
    colours: p.colours,
    is_active: p.is_active,
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    updated_at: now,
  }));

  // Insert in batches to avoid payload limits
  const batchSize = 50;
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < productRows.length; i += batchSize) {
    const batch = productRows.slice(i, i + batchSize);
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "id" });
    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    } else {
      imported += batch.length;
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "Some product batches failed to import.",
        imported,
        total: productRows.length,
        categories: categories.length,
        errors,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Import complete.",
    imported: imported,
    categories: categories.length,
    total: productRows.length,
  });
}

export async function GET() {
  return NextResponse.json({
    available: true,
    categories: catalog.categories.length,
    products: catalog.products.length,
  });
}
