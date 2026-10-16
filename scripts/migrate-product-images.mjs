import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BUCKET = "product-images";
const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "src/lib/data/catalog.json");
const PUBLIC_ROOT = path.join(ROOT, "public");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Supabase URL/service role key are not configured.");
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
  }[ext] ?? "application/octet-stream";
}

async function ensureBucket() {
  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (createError && !/already exists/i.test(createError.message || "")) {
    throw new Error(`Could not create/access bucket ${BUCKET}: ${createError.message}`);
  }
  const { error: accessError } = await supabase.storage.from(BUCKET).list();
  if (accessError) throw new Error(`Bucket ${BUCKET} is not accessible: ${accessError.message}`);
}

async function readImageBuffer(source) {
  if (source.startsWith("/images/products/")) {
    const filePath = path.join(PUBLIC_ROOT, source);
    if (!fs.existsSync(filePath)) return null;
    return await fs.promises.readFile(filePath);
  }
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) return null;
    const array = await res.arrayBuffer();
    return Buffer.from(array);
  }
  return null;
}

async function main() {
  await ensureBucket();

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const products = catalog.products ?? [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const updatedProducts = [...products];

  for (const product of products) {
    const source = product.primary_image_url || product.legacy_image_source;
    if (!source) {
      skipped++;
      continue;
    }

    let buffer;
    try {
      buffer = await readImageBuffer(source);
    } catch {
      buffer = null;
    }
    if (!buffer) {
      skipped++;
      continue;
    }

    const ext = path.extname(source.split("?")[0]) || ".jpg";
    const fileName = `${product.slug}-${product.sku ?? product.id}${ext}`;
    const storagePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: contentTypeFor(source),
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);
      const publicUrl = publicData.publicUrl;

      const { error: dbError } = await supabase
        .from("products")
        .update({ primary_image_url: publicUrl })
        .eq("id", product.id);

      if (dbError) throw dbError;

      const idx = updatedProducts.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        updatedProducts[idx] = { ...updatedProducts[idx], primary_image_url: publicUrl };
      }

      uploaded++;
      process.stdout.write(`\rUploaded ${uploaded}/${products.length}: ${product.slug}`);
    } catch (error) {
      failed++;
      console.error(
        `\nFailed ${product.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  catalog.products = updatedProducts;
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");

  console.log(
    `\nMigration complete. Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
