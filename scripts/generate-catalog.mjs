import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const audit = (f) => path.join(ROOT, "audit", f);

const products = JSON.parse(fs.readFileSync(audit("products.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(audit("download-report.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(audit("image-manifest.json"), "utf8"));

/** Deterministic UUID (v5-shaped) so local + Supabase seeds agree. */
function stableUuid(key) {
  const h = crypto.createHash("sha1").update(`bangles-by-beauty:${key}`).digest("hex");
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    "5" + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity) => {
    if (entity.charCodeAt(0) === 35) {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return match;
      return String.fromCodePoint(code);
    }
    return entity.toLowerCase() === "rupee" ? "\u20B9" : match;
  });
}

/**
 * Rewrites the migrated pack/price phrasing into plain English. Only touches
 * descriptions that actually carry a legacy "pack of … price …" fragment; every
 * other description is left as-is for the runtime entity decoder.
 */
function normalizeLegacyPriceText(text) {
  if (!/pack\s+of/i.test(text) || !/price/i.test(text)) return text;
  const decoded = decodeEntities(text);
  const packs = [...decoded.matchAll(/pack\s+of\s+(\d+)/gi)].map((m) => m[1]);
  const prices = [...decoded.matchAll(/\u20B9\s*([\d,]+)/g)]
    .map((m) => m[1])
    .join(",")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!packs.length || packs.length !== prices.length) return decoded;
  const options = packs.map((size, i) => `${size} (\u20B9${prices[i]})`);
  const list =
    options.length <= 1
      ? options.join("")
      : `${options.slice(0, -1).join(", ")} and ${options[options.length - 1]}`;
  const sentence = `Available in packs of ${list}.`;
  const remainder = decoded
    .replace(
      /\(?\s*pack\s+of\s+[\d,\s]*(?:pack\s+of\s+[\d,\s]*)*\)?\s*\(?\s*price\s+[^)]*\)?/i,
      "",
    )
    .replace(/[\s.]+$/g, "")
    .trim();
  if (!remainder) return `${sentence} Handcrafted with love from Pattukottai.`;
  return decoded
    .replace(
      /\(?\s*pack\s+of\s+[\d,\s]*(?:pack\s+of\s+[\d,\s]*)*\)?\s*\(?\s*price\s+[^)]*\)?/i,
      sentence,
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** url -> relative path under public/ */
const urlToPath = new Map();
for (const r of report) {
  if (r.status === "ok" || r.status === "cached") {
    urlToPath.set(r.url, "/images/" + r.dest.replace(/\\/g, "/").replace(/\.(png|jpeg)$/i, ".jpg"));
  }
}
const BASE = "https://banglesbybeauty.com";
function resolveImage(u) {
  if (!u) return null;
  const abs = u.startsWith("http") ? u : BASE + u;
  return urlToPath.get(abs) ?? null;
}

const COLOUR_VOCAB = [
  "antique gold", "dark gold", "light gold", "yellowish gold", "creamy gold", "golden yellow",
  "parrot green", "dark green", "light green", "bottle green", "leaf green", "forest green",
  "pista green", "pistachio green", "ramar green", "grape", "grape green",
  "sky blue", "skyblue", "dark sky blue", "dark skyblue", "candy skyblue", "royal blue",
  "light blue", "ink blue", "navy blue", "baby blue", "peacock blue", "peacock",
  "rani pink", "dark pink", "light pink", "baby pink", "onion pink", "onion pink",
  "bright pink", "hot pink", "mild peach", "lemon yellow", "golden", "gold",
  "maroon", "marron", "lavender", "lilac", "mustard", "teal green", "teal",
  "violet", "purple", "orange", "yellow", "green", "blue", "red", "pink",
  "white", "cream", "creamy white", "gray", "grey", "black", "peach", "beige",
  "ivory", "mint", "aqua", "aqua blue", "turquoise", "bronze", "silver", "copper",
  "multi shade", "multi", "mirror white", "crystal white", "glass",
].sort((a, b) => b.length - a.length);

function extractColours(text) {
  const t = " " + text.toLowerCase().replace(/[(),]/g, " ").replace(/\s+/g, " ") + " ";
  const found = new Set();
  for (const c of COLOUR_VOCAB) {
    const re = new RegExp(`(?<![a-z])${c.replace(/ /g, "\\s+")}(?![a-z])`, "i");
    if (re.test(t)) found.add(c);
  }
  // Drop colours fully covered by a longer match already present
  const list = [...found];
  const kept = list.filter((c) => !list.some((o) => o !== c && o.includes(c)));
  return kept.sort();
}

const CATEGORY_ORDER = [
  "Border bangles", "Bridal bangles", "Glass Bangles", "Ready to wear bangles",
  "Kundan hair bands", "Centre clips", "Brooch pins", "Jada pillai",
  "Jasmine clip", "Return gifts combo",
];

const CATEGORY_COPY = {
  "Border bangles": "Intricately detailed bangles that frame the wrist — kundan, coin, lotus and crystal work.",
  "Bridal bangles": "Complete bridal sets built for the wedding day and the celebrations around it.",
  "Glass Bangles": "Classic glass bangles with delicate finishes for everyday and festive wear.",
  "Ready to wear bangles": "Set-of-bangles pieces you can slip on without matching individual bangles.",
  "Kundan hair bands": "Kundan and mirror work hair bands for festive and traditional looks.",
  "Centre clips": "Crystal and floral centre clips to finish a braided or bunned hairstyle.",
  "Brooch pins": "Small brooch pins in leaf, star, coin and crystal motifs.",
  "Jada pillai": "Jada pillai chains and hair hooks with coin, lotus and pearl detailing.",
  "Jasmine clip": "Jasmine hair accessories and combos for traditional hairstyling.",
  "Return gifts combo": "Assorted combos curated for return gifts at weddings and functions.",
};

const seenSlugs = new Map();
function uniqueSlug(base) {
  let s = base || "product";
  if (!seenSlugs.has(s)) {
    seenSlugs.set(s, 1);
    return s;
  }
  let i = seenSlugs.get(s) + 1;
  while (seenSlugs.has(`${s}-${i}`)) i++;
  seenSlugs.set(s, i);
  seenSlugs.set(`${s}-${i}`, 1);
  return `${s}-${i}`;
}

// ---------- categories ----------
const categoryCounts = {};
for (const p of products) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;

const categories = CATEGORY_ORDER.map((name, idx) => ({
  id: stableUuid(`category:${name}`),
  name,
  slug: slugify(name),
  description: CATEGORY_COPY[name] ?? null,
  image_url: null,
  sort_order: idx,
  is_active: (categoryCounts[name] ?? 0) > 0,
  product_count: categoryCounts[name] ?? 0,
})).sort((a, b) => a.sort_order - b.sort_order);

// Primary image per category: first product image in that category
for (const c of categories) {
  const first = products.find((p) => p.category === c.name && resolveImage(p.image));
  c.image_url = first ? resolveImage(first.image) : null;
}

const catIdByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

// ---------- products ----------
const FEATURED_SKUS = ["BNG-177", "BNG-175", "BNG-158", "BNG-173", "BNG-170", "BNG-152", "BNG-159"];
const NEW_ARRIVAL_SKUS = ["BNG-177", "BNG-173", "BNG-172", "BNG-171", "BNG-170", "BNG-169", "BNG-168"];

/**
 * Glass bangles are sold in eight colourways, each with its own photograph.
 * The originals were downloaded to `public/images/products/colors` from the
 * source site's per-colour media. "Orange" and "Pista" have no separate
 * photography, so they reuse the closest available image.
 */
const GLASS_COLOUR_IMAGES = {
  "BNG-159": [
    { colour: "Forest Green", image_url: "/images/products/colors/bng-159-forest-green.jpg" },
    { colour: "Pista Green", image_url: "/images/products/colors/bng-159-pista-green.jpg" },
    { colour: "Pink", image_url: "/images/products/colors/bng-159-pink.jpg" },
    { colour: "Maroon", image_url: "/images/products/colors/bng-159-maroon.jpg" },
    { colour: "Red", image_url: "/images/products/colors/bng-159-red.jpg" },
    { colour: "Rust Orange", image_url: "/images/products/colors/bng-159-rust-orange.jpg" },
    { colour: "Orange", image_url: "/images/products/colors/bng-159-rust-orange.jpg" },
    { colour: "Pista", image_url: "/images/products/colors/bng-159-pista-green.jpg" },
  ],
};

// Unique, hand-written copy for every SKU lives in scripts/product-descriptions.json
// so regenerating the catalogue never falls back to the duplicated legacy text.
const DESCRIPTION_OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "product-descriptions.json"), "utf8"),
);

const out = products.map((p, i) => {
  const slug = uniqueSlug(slugify(p.name));
  const image = resolveImage(p.image);
  const glassColours = GLASS_COLOUR_IMAGES[p.sku];
  const colours = glassColours ? glassColours.map((c) => c.colour) : extractColours(`${p.name} ${p.description}`);
  return {
    id: stableUuid(`product:${p.sku}`),
    category_id: catIdByName[p.category] ?? null,
    name: p.name.trim().replace(/\s+/g, " "),
    slug,
    description: DESCRIPTION_OVERRIDES[p.sku] ?? normalizeLegacyPriceText((p.description || "").trim()),
    sku: p.sku,
    price: Number(p.price),
    compare_at_price: null,
    stock_quantity: null,
    primary_image_url: image,
    colours,
    ...(glassColours ? { colour_images: glassColours } : {}),
    is_active: true,
    is_featured: FEATURED_SKUS.includes(p.sku),
    is_new_arrival: NEW_ARRIVAL_SKUS.includes(p.sku),
    seo_title: null,
    seo_description: null,
    legacy_id: p.id,
    legacy_image_source: p.image || null,
    sort_index: i,
  };
});

const missingImage = out.filter((p) => !p.primary_image_url);
const missingPath = out.filter((p) => p.primary_image_url && !manifest[p.primary_image_url.replace(/^\//, "")]);

const payload = { categories, products: out };
fs.writeFileSync(path.join(ROOT, "src", "lib", "data", "catalog.json"), JSON.stringify(payload, null, 2));
fs.writeFileSync(audit("catalog-facet-report.json"), JSON.stringify({
  total: out.length,
  categories: categories.map((c) => ({ name: c.name, count: c.product_count, active: c.is_active })),
  missingImage: missingImage.map((p) => p.sku),
  missingFile: missingPath.map((p) => p.primary_image_url),
  featured: out.filter((p) => p.is_featured).map((p) => p.sku),
  newArrivals: out.filter((p) => p.is_new_arrival).map((p) => p.sku),
  withColours: out.filter((p) => p.colours.length).length,
  priceMin: Math.min(...out.map((p) => p.price)),
  priceMax: Math.max(...out.map((p) => p.price)),
}, null, 2));

console.log("products:", out.length, "categories:", categories.length);
console.log("missing image:", missingImage.map((p) => p.sku));
console.log("missing file:", missingPath.length);
console.log("colour facets on:", out.filter((p) => p.colours.length).length, "products");
console.log("unique slugs:", new Set(out.map((p) => p.slug)).size);
console.log("featured:", FEATURED_SKUS.length, "new:", NEW_ARRIVAL_SKUS.length);
console.log("wrote src/lib/data/catalog.json");
