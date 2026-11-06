// Migration script: Split multi-colour Glass Bangles products into
// individual per-colour products.
//
// Usage:
//   node scripts/migrate-glass-bangles-by-colour.mjs
//
// Reads src/lib/data/catalog.json (seed) and .data/catalog.json (runtime),
// splits each Glass Bangles product with multiple colours into N individual
// products (one per colour), deactivates the originals, and writes back.
// Also prints Supabase SQL for the production database.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEED_PATH = path.join(ROOT, "src", "lib", "data", "catalog.json");
const RUNTIME_PATH = path.join(ROOT, ".data", "catalog.json");
const GLASS_CATEGORY_ID = "21c45a58-1868-5636-a6ca-f233f61f95b8";

const COLOUR_SLUG = {
  "forest green": "forest-green",
  "pista green": "pista-green",
  pink: "pink",
  maroon: "maroon",
  red: "red",
  "rust orange": "rust-orange",
  orange: "orange",
  pista: "pista",
};

const COLOUR_SKU = {
  "forest green": "FG",
  "pista green": "PG",
  pink: "PK",
  maroon: "MR",
  red: "RD",
  "rust orange": "RO",
  orange: "OR",
  pista: "PS",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function colourSlug(colour) {
  return COLOUR_SLUG[colour.trim().toLowerCase()] ?? slugify(colour);
}

function colourSku(colour) {
  return COLOUR_SKU[colour.trim().toLowerCase()] ?? slugify(colour).toUpperCase().slice(0, 4);
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function splitProduct(product) {
  const colours = product.colours || [];
  if (colours.length <= 1) return { original: product, splits: [] };

  const colourImagesByName = new Map(
    (product.colour_images || []).map((ci) => [ci.colour.toLowerCase(), ci.image_url]),
  );

  const splits = [];
  const baseSku = product.sku || "BNG";

  for (const colour of colours) {
    const cSlug = colourSlug(colour);
    const imageUrl = colourImagesByName.get(colour.toLowerCase()) || product.primary_image_url || null;

    splits.push({
      id: uuid(),
      category_id: product.category_id,
      name: `${product.name} – ${colour}`,
      slug: `${product.slug}-${cSlug}`,
      description: product.description,
      sku: `${baseSku}-${colourSku(colour)}`,
      price: product.price,
      compare_at_price: product.compare_at_price,
      stock_quantity: null,
      primary_image_url: imageUrl,
      colours: [colour],
      colour_images: imageUrl ? [{ colour, image_url: imageUrl }] : [],
      is_active: true,
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      legacy_id: product.legacy_id,
      legacy_image_source: product.legacy_image_source,
      sort_index: product.sort_index,
      created_at: nowIso(),
      updated_at: nowIso(),
      variants: ["2.2", "2.4", "2.6", "2.8", "2.10"].map((size) => ({
        id: uuid(),
        product_id: "__PLACEHOLDER__",
        variant_name: "Size",
        variant_value: size,
        size,
        colour,
        colour_hex: null,
        image_url: imageUrl,
        sku: null,
        stock_quantity: null,
        price_override: null,
        is_active: true,
        created_at: nowIso(),
        updated_at: nowIso(),
      })),
    });
  }

  const original = { ...product, is_active: false, updated_at: nowIso() };
  return { original, splits };
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function migrateCatalog(catalog) {
  const products = [...catalog.products];
  const sql = [];
  const report = [];

  const glassProducts = products.filter(
    (p) => p.category_id === GLASS_CATEGORY_ID && Array.isArray(p.colours) && p.colours.length > 1,
  );

  for (const product of glassProducts) {
    const { original, splits } = splitProduct(product);

    const idx = products.findIndex((p) => p.id === product.id);
    products[idx] = original;

    for (const split of splits) {
      for (const variant of split.variants) {
        variant.product_id = split.id;
      }
      products.push(split);
    }

    sql.push(`alter table public.product_variants add column if not exists colour text;`);
    sql.push(`alter table public.product_variants add column if not exists colour_hex text;`);
    sql.push(`alter table public.product_variants add column if not exists size text;`);
    sql.push(`alter table public.product_variants add column if not exists image_url text;`);
    sql.push("");
    sql.push(`-- Split "${product.name}" (${product.id}) into ${splits.length} colour products`);
    sql.push(`UPDATE public.products SET is_active = false, updated_at = now() WHERE id = ${sqlString(product.id)};`);
    for (const split of splits) {
      const values = [
        sqlString(split.id),
        sqlString(split.category_id),
        sqlString(split.name),
        sqlString(split.slug),
        sqlString(split.description),
        sqlString(split.sku),
        split.price,
        split.compare_at_price !== null && split.compare_at_price !== undefined ? split.compare_at_price : "NULL",
        split.stock_quantity !== null && split.stock_quantity !== undefined ? split.stock_quantity : "NULL",
        sqlString(split.primary_image_url || ""),
        `ARRAY[${split.colours.map((c) => sqlString(c)).join(", ")}]`,
        sqlString(JSON.stringify(split.colour_images)),
        split.is_active,
        split.is_featured,
        split.is_new_arrival,
        split.seo_title !== null && split.seo_title !== undefined ? sqlString(split.seo_title) : "NULL",
        split.seo_description !== null && split.seo_description !== undefined ? sqlString(split.seo_description) : "NULL",
        sqlString(split.legacy_id || ""),
        sqlString(split.legacy_image_source || ""),
        split.sort_index,
        "now()",
        "now()",
      ].join(", ");
      sql.push(`INSERT INTO public.products (id, category_id, name, slug, description, sku, price, compare_at_price, stock_quantity, primary_image_url, colours, colour_images, is_active, is_featured, is_new_arrival, seo_title, seo_description, legacy_id, legacy_image_source, sort_index, created_at, updated_at) VALUES (${values});`);
      for (const variant of split.variants) {
        sql.push(`INSERT INTO public.product_variants (id, product_id, variant_name, variant_value, sku, price_override, stock_quantity, is_active, colour, colour_hex, size, image_url, created_at, updated_at) VALUES (${sqlString(variant.id)}, ${sqlString(variant.product_id)}, ${sqlString(variant.variant_name)}, ${sqlString(variant.variant_value)}, ${variant.sku ? sqlString(variant.sku) : "NULL"}, ${variant.price_override !== null && variant.price_override !== undefined ? variant.price_override : "NULL"}, ${variant.stock_quantity !== null && variant.stock_quantity !== undefined ? variant.stock_quantity : "NULL"}, ${variant.is_active}, ${variant.colour ? sqlString(variant.colour) : "NULL"}, ${variant.colour_hex ? sqlString(variant.colour_hex) : "NULL"}, ${variant.size ? sqlString(variant.size) : "NULL"}, ${variant.image_url ? sqlString(variant.image_url) : "NULL"}, now(), now());`);
      }
      sql.push(`INSERT INTO public.category_products (id, category_id, product_id, sort_order, created_at, updated_at) VALUES (${sqlString(uuid())}, ${sqlString(split.category_id)}, ${sqlString(split.id)}, 0, now(), now());`);
    }
    sql.push("");
  }

  report.push(`Glass Bangles multi-colour products found: ${glassProducts.length}`);
  for (const product of glassProducts) {
    const { splits } = splitProduct(product);
    report.push(`  - ${product.name} → ${splits.length} products: ${splits.map((s) => s.slug).join(", ")}`);
  }

  return { products, sql, report };
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${filePath}`);
}

function main() {
  const seedExists = fs.existsSync(SEED_PATH);
  const runtimeExists = fs.existsSync(RUNTIME_PATH);

  if (!seedExists && !runtimeExists) {
    console.error("No catalog.json found.");
    process.exit(1);
  }

  let combinedSql = [];
  let combinedReport = [];

  if (seedExists) {
    const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
    const { products, sql, report } = migrateCatalog(seed);
    writeJson(SEED_PATH, { ...seed, products });
    combinedSql = combinedSql.concat(sql);
    combinedReport = combinedReport.concat(report);
  }

  if (runtimeExists) {
    const runtime = JSON.parse(fs.readFileSync(RUNTIME_PATH, "utf8"));
    const { products, sql, report } = migrateCatalog(runtime);
    writeJson(RUNTIME_PATH, { ...runtime, products });
    combinedSql = combinedSql.concat(sql);
    combinedReport = combinedReport.concat(report);
  }

  console.log("\n=== Migration Report ===");
  for (const line of combinedReport) console.log(line);

  const sqlPath = path.join(ROOT, "scripts", "migrate-glass-bangles-by-colour.sql");
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, combinedSql.join("\n") + "\n");
  console.log(`\nSupabase SQL written to ${sqlPath}`);
  console.log("\nNext steps:");
  console.log("  1. Run the generated SQL against your Supabase database.");
  console.log("  2. Deploy the frontend changes (hide colour UI when single colour).");
}

main();
