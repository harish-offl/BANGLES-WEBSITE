// Uploads the audited product photography to the `product-images` Supabase
// Storage bucket and points each product row at its hosted public URL.
//
//   node scripts/upload-images.mjs [--dry-run] [--limit N]
//
// Required environment:
//   NEXT_PUBLIC_SUPABASE_URL      https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     service-role key (never exposed to the client)
//
// The script is idempotent: it skips any product that already has a hosted
// image_url starting with the Supabase storage host, and only seeds
// `product_images` for products that have no image rows yet.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const BUCKET = "product-images";
const CONCURRENCY = 6;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.indexOf("--limit");
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Nothing to do.",
    );
    process.exit(1);
  }

  const storageHost = new URL(url).host;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const catalog = JSON.parse(
    await readFile(path.join(root, "src", "lib", "data", "catalog.json"), "utf8"),
  );

  const targets = catalog.products
    .filter((p) => p.primary_image_url && p.primary_image_url.startsWith("/images/"))
    .slice(0, limit);

  console.log(
    `${dryRun ? "[dry-run] " : ""}Preparing to upload ${targets.length} product image(s).`,
  );

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  async function handle(product) {
    const localPath = path.join(root, "public", product.primary_image_url.replace(/^\//, ""));
    const filename = path.basename(product.primary_image_url);
    const storagePath = `${product.id}/${filename}`;
    const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${storagePath}`;

    try {
      const { data: existing, error: existingError } = await supabase
        .from("products")
        .select("primary_image_url")
        .eq("id", product.id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing?.primary_image_url?.includes(storageHost)) {
        skipped += 1;
        return;
      }

      if (dryRun) {
        console.log(`  would upload ${product.sku ?? product.id} → ${storagePath}`);
        return;
      }

      const file = await readFile(localPath);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: contentTypeFor(filename),
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("products")
        .update({ primary_image_url: publicUrl })
        .eq("id", product.id);
      if (updateError) throw updateError;

      const { count } = await supabase
        .from("product_images")
        .select("id", { count: "exact", head: true })
        .eq("product_id", product.id);

      if (!count) {
        const { error: imageError } = await supabase.from("product_images").insert({
          product_id: product.id,
          image_url: publicUrl,
          storage_path: storagePath,
          alt_text: product.name,
          sort_order: 0,
        });
        if (imageError) throw imageError;
      }

      uploaded += 1;
      console.log(`  uploaded ${product.sku ?? product.id} → ${storagePath}`);
    } catch (error) {
      failed += 1;
      console.error(`  failed ${product.sku ?? product.id}: ${error.message ?? error}`);
    }
  }

  const queue = [...targets];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next) await handle(next);
    }
  });
  await Promise.all(workers);

  console.log(
    `${dryRun ? "[dry-run] " : ""}Done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
