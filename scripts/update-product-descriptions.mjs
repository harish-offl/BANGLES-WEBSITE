// Fills in real, product-specific descriptions in Supabase.
//
//   node --env-file=.env.local scripts/update-product-descriptions.mjs
//   node --env-file=.env.local scripts/update-product-descriptions.mjs --force
//
// The original migration seeded every product with the same generic blurb
// ("Handcrafted with love from Pattukottai..."). This script matches the
// catalogue copy in src/lib/data/catalog.json by SKU (falling back to slug).
// By default it only overwrites rows that still carry the generic/empty
// placeholder, so hand-written descriptions added later in the admin panel are
// preserved. Pass --force for the catalogue-wide description refresh.

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "src/lib/data/catalog.json");
const GENERIC_PREFIX = "Handcrafted with love from Pattukottai";
const force = process.argv.includes("--force");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Supabase URL/service role key are not configured.");
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isPlaceholder(description) {
  const text = (description ?? "").trim();
  return text.length === 0 || text.startsWith(GENERIC_PREFIX);
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const bySku = new Map();
  const bySlug = new Map();
  for (const product of catalog.products) {
    if (product.sku) bySku.set(product.sku, product);
    bySlug.set(product.slug, product);
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, sku, description");
  if (error) throw new Error(`Could not load products: ${error.message}`);

  let updated = 0;
  let skipped = 0;
  const missing = [];

  for (const row of data ?? []) {
    const source = (row.sku && bySku.get(row.sku)) ?? bySlug.get(row.slug);
    if (!source?.description) {
      missing.push(row.slug);
      continue;
    }
    if (!force && !isPlaceholder(row.description)) {
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        description: source.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (updateError) {
      throw new Error(`Could not update ${row.slug}: ${updateError.message}`);
    }
    updated += 1;
  }

  console.log(`Mode: ${force ? "force" : "placeholders only"}`);
  console.log(`Updated: ${updated}`);
  console.log(`Kept existing description: ${skipped}`);
  console.log(`No catalogue description: ${missing.length}`);
  if (missing.length) console.log(missing.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
