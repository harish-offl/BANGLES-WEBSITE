// Expands every catalogue description to roughly 30-60 words.
//
//   node scripts/enhance-product-descriptions.mjs
//
// Existing product-specific openers are kept. A category-aware styling
// sentence is appended only when the copy is still under 30 words, and a few
// unsupported claims are softened. The script rewrites:
//   - src/lib/data/catalog.json
//   - scripts/product-descriptions.json
// and leaves a review dump in the OS temp directory.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "src/lib/data/catalog.json");
const DESCRIPTIONS_PATH = path.join(ROOT, "scripts/product-descriptions.json");
const REVIEW_PATH = path.join(os.tmpdir(), "bangles-descriptions-review.txt");

const TARGET_MIN = 30;
const TARGET_MAX = 60;

// Copy that made unsupported claims (hand-finished, lightweight, comfortable,
// every skin tone, fraction of the price, matte/glossy finish) or leaned on
// "real gold" wording. The replacement keeps the same product facts.
const OVERRIDES = {
  "BNG-175":
    "Square kundan stones set on a golden silk thread base, these border bangles catch the light with every move. It is a festive pick that pairs as easily with silk sarees as with lehengas.",
  "BNG-30":
    "Ganesh bangles featuring Lord Ganesha motifs — an auspicious border pair for weddings, poojas and festival days.",
  "BNG-170":
    "Diamond-look lotus border bangles with a radiant lotus motif, made for brides who want a high-sparkle look.",
  "BNG-147":
    "A diamond-look brooch pin with faceted stones that catch the light.",
  "BNG-38":
    "Vasutha in soothing cream, a neutral bridal stack that pairs easily with a range of outfits.",
  "BNG-129":
    "Marigold hair band in orange with white, with bright bloom tones in a traditional design.",
  "BNG-63":
    "Mini Vasutha in peach and white, a compact starter set for minimal brides.",
  "BNG-56":
    "Minimal series in white glass with peacock blue, a slim set that keeps the look clean and traditional.",
  "BNG-90":
    "Jadu in full gold — a monochrome, gold-toned stack with a rich metallic finish.",
  "BNG-148":
    "Five delicate leaves fan out across this compact brooch pin — a nature-inspired finish for any outfit.",
  "BNG-103":
    "Alangara bridal set in radiant red, ornate and richly detailed for the traditional bride.",
  "BNG-70":
    "Vasutha in multicolour with red, an assorted stack that is easy to coordinate with bridal outfits.",
  "BNG-130":
    "Marigold hair band in red with green, set with kundan stones for a traditional festive look.",
  "BNG-167":
    "7 cm rectangle centre clip in deep maroon crystals, finished with a double-lock clip.",
  "BNG-169":
    "7 cm rectangle centre clip paved with lavender crystal stones and a double-lock clasp for a secure hold.",
  "BNG-177":
    "The Yazhi bridal set 2.0 in maroon and gold — a premium handcrafted set of 9 bangles for one hand, 18 for both. It is a rich choice for weddings, receptions and festive family gatherings. Size customisation available on WhatsApp at 6381137076.",
  "BNG-152":
    "A two-hand Artha set of 38 assorted bangles in red with orange. It is an easy set to style with silk sarees and lehengas for weddings, receptions and festive family gatherings. Available in sizes 2.4, 2.6, 2.8 and 2.10; contact us on WhatsApp for other sizes. Made to order, dispatched in 5 to 7 days.",
  "BNG-39":
    "Thamarai 2.0 in dark pink and pista green — the earlier-generation lotus set with a soft green lift. The dark pink and pista green finish keeps the look traditional, whether you wear it with kanjeevaram sarees or silk sarees. It works well for weddings, receptions and festive family gatherings.",
  "BNG-149":
    "A slim red leaf brooch pin that adds a pop of colour to saree pallus, dupattas and jackets. Pin it on saree blouses, dupattas or kurtas for a quick traditional accent at weddings, festivals and family gatherings.",
  "BNG-148":
    "Five delicate leaves fan out across this compact brooch pin — a nature-inspired finish for any outfit. Pin it on saree blouses, kurtas or dupattas for a quick traditional accent at weddings, festivals and family gatherings.",
  "BNG-146":
    "Lotus-shaped brooch pin centred with a sparkling crystal, blending traditional motif with a touch of glamour. It is a simple way to add a traditional accent without a full jewellery set, and it works well for weddings, festivals and family gatherings.",
  "BNG-138":
    "Flower centre clip with layered pink outer petals and a green core, designed to sit proudly over a braid. Its green and pink tones pair easily with sarees, lehengas and other ethnic outfits at weddings, festivals and family gatherings.",
  "BNG-131":
    "Mini lotus hair band in lemon yellow with green — a sunny, cheerful take on the mini lotus design. The green and yellow palette works with both simple and elaborate hairstyles for weddings, festivals and family gatherings.",
};

const CATEGORY_COPY = {
  "border-bangles": {
    type: "pair",
    plural: "bangles",
    outfits: ["silk sarees", "half-sarees", "lehengas", "kurta sets", "cotton sarees"],
    occasions: [
      "poojas",
      "temple visits",
      "weddings",
      "festival days",
      "family gatherings",
      "festive occasions",
    ],
    style: "shared",
  },
  "bridal-bangles": {
    type: "bridal set",
    plural: "bridal set",
    outfits: ["silk sarees", "lehengas", "bridal half-sarees", "kanjeevaram sarees"],
    occasions: [
      "weddings",
      "receptions",
      "muhurtham",
      "sangeet",
      "engagements",
      "festive family gatherings",
    ],
    style: "shared",
  },
  "glass-bangles": {
    type: "glass set",
    plural: "glass bangles",
    outfits: ["cotton sarees", "silk sarees", "kurta sets", "lehengas"],
    occasions: ["family gatherings", "weddings", "festivals", "everyday wear", "poojas"],
    style: "glass",
  },
  "kundan-hair-bands": {
    type: "hair band",
    plural: "hair band",
    outfits: ["sarees", "lehengas", "salwar suits"],
    occasions: ["weddings", "festivals", "family gatherings", "festive occasions"],
    style: "hair",
  },
  "centre-clips": {
    type: "centre clip",
    plural: "centre clip",
    outfits: ["sarees", "lehengas", "salwar suits"],
    occasions: ["weddings", "festivals", "family gatherings", "festive occasions"],
    style: "centre",
  },
  "brooch-pins": {
    type: "brooch pin",
    plural: "brooch pin",
    outfits: ["saree blouses", "kurtas", "dupattas", "jackets"],
    occasions: ["weddings", "festivals", "family gatherings", "poojas"],
    style: "brooch",
  },
  "jada-pillai": {
    type: "jada piece",
    plural: "jada piece",
    outfits: ["bridal jada styles", "traditional hairstyles"],
    occasions: ["weddings", "festivals", "classical dance performances"],
    style: "jada",
  },
  "jasmine-clip": {
    type: "jasmine set",
    plural: "jasmine set",
    outfits: ["bridal jada styles", "traditional hairstyles"],
    occasions: ["weddings", "festivals", "dance performances"],
    style: "jada",
  },
};

const TEMPLATES = {
  shared: {
    colour: [
      "With its {c} tones, it pairs easily with {o1} and {o2} for {e1} and {e2}.",
      "The {c} palette gives the {type} a traditional finish that works well for {e1}, {e2} and {e3}.",
      "Its {c} shades make it an easy match for {o1} at {e1}, and for {o2} at {e2}.",
      "The {c} combination is festive without being loud, so it suits {e1} and {e2}.",
      "Pair the {c} {plural} with {o1} for {e1}, or with {o2} for {e2}.",
      "The {c} tones add a festive lift to {o1} and {o2}, especially for {e1} and {e2}.",
      "Style the {c} {plural} with {o1} and gold-toned jewellery for a complete look at {e1}.",
      "The {c} finish keeps the look traditional, whether you wear it with {o1} or {o2}.",
      "It brings {c} tones to {o1} and {o2}, making it a strong choice for {e1} and {e2}.",
      "The {c} palette is versatile enough for {e1}, {e2} and other celebrations.",
      "Wear it with {o1} or {o2} to bring out the {c} tones at {e1} and {e2}.",
      "The {c} shades and traditional design make it suitable for {e1}, {e2} and family functions.",
      "Against {o1} and {o2}, the {c} tones stand out beautifully at {e1} and {e2}.",
      "The {c} palette is easy to style for {e1}, especially with {o1} and {o2}.",
      "For {e1}, pair the {c} {plural} with {o1}; for {e2}, try {o2}.",
      "The {c} finish adds a festive accent to {o1}, {o2} and other ethnic outfits.",
      "It looks especially good with {o1} and {o2} for {e1}, {e2} and other celebrations.",
      "The {c} tones keep the look traditional for {e1}, {e2} and other celebrations.",
      "Wear the {c} {plural} with {o1} for {e1}, or with {o2} for a softer look at {e2}.",
      "The {c} palette works well for {e1} and {e2}, and pairs easily with {o1} and {o2}.",
      "Its {c} finish makes the {type} a natural match for {o1} at {e1} and {e2}.",
      "The {c} combination adds a traditional touch to {o1}, {o2} and festive outfits.",
      "Style it with {o1} for {e1}, or let the {c} tones stand out with {o2} at {e2}.",
      "The {c} shades give the {type} a festive look that works for {e1}, {e2} and {e3}.",
    ],
    plain: [
      "It pairs easily with {o1} and {o2} for {e1}, {e2} and other celebrations.",
      "The traditional design works well for {e1}, {e2} and {e3}.",
      "Wear it with {o1} or {o2} for {e1}, {e2} and other festive occasions.",
      "It is an easy piece to style with {o1}, {o2} and other ethnic outfits.",
      "The look is festive enough for {e1} and {e2}, yet easy to pair with {o1}.",
      "Pair it with {o1} for {e1}, or keep it simple with {o2} for {e2}.",
      "It adds a traditional finish to {o1}, {o2} and other ethnic outfits.",
      "The {motif} design sits well with {o1} and {o2} at {e1} and {e2}.",
      "It works beautifully for {e1}, {e2} and {e3}, especially with {o1}.",
      "The piece is traditional, easy to style and suited to {e1} and {e2}.",
      "Style it with {o1} and gold-toned jewellery for a complete look at {e1}.",
      "It is a versatile choice for {e1}, {e2} and other festive occasions.",
      "The {motif} detailing gives the {type} a traditional look for {e1} and {e2}.",
      "Wear it with {o1} for {e1}, or with {o2} for a more understated {e2} look.",
      "It brings a traditional finish to {o1}, {o2} and festive family outfits.",
      "The {motif} design pairs easily with {o1} and {o2} for {e1} and {e2}.",
      "For {e1}, style it with {o1}; for {e2}, try {o2} and keep the rest simple.",
      "It is a traditional piece that works well for {e1}, {e2} and family functions.",
      "The design adds a festive accent to {o1}, {o2} and other traditional outfits.",
      "It looks especially good with {o1} and {o2} for {e1} and {e2}.",
    ],
  },
  glass: {
    colour: [
      "Mix the {c} shades with {o1}, {o2} and {o3}.",
      "The {c} palette adds a bright, traditional touch to everyday and festive outfits.",
      "Stack a few of the {c} bangles for a subtle look, or wear the full set for {e1}.",
      "Wear the {c} set with {o1} or {o2} for {e1} and {e2}.",
    ],
    plain: [
      "Mix the shades with {o1}, {o2} and {o3}.",
      "The colourful set adds a traditional touch to daily wear and celebration looks.",
      "Stack a few for a subtle look or wear the full set for {e1} and {e2}.",
      "The glass bangles are an easy way to add colour to everyday and festive outfits.",
      "Wear them with {o1} or {o2} for {e1} and {e2}.",
    ],
  },
  hair: {
    colour: [
      "The {c} finish gives the hair band a traditional look for {e1} and {e2}.",
      "The {c} tones pair easily with sarees, lehengas and other ethnic outfits.",
      "It adds {c} tones to braids, buns and festive hairstyles.",
      "The {c} palette keeps the look traditional for {e1}, {e2} and other celebrations.",
      "Wear it with traditional outfits to bring out the {c} tones at {e1} and {e2}.",
      "The {c} detailing adds a traditional accent to braids and festive hairstyles.",
      "It finishes a braid or festive hairstyle with {c} tones for {e1}.",
      "The {c} palette works well with both simple and elaborate hairstyles.",
      "Its {c} tones bring an accent to jada styling and festive outfits.",
      "The {c} finish makes it an easy match for {o1} and {o2}.",
    ],
    plain: [
      "It finishes a braid or festive hairstyle for {e1}, {e2} and {e3}.",
      "Use it to add a traditional accent to jada styling and celebration outfits.",
      "It is a simple finishing piece for {e1} and {e2}.",
      "It pairs easily with sarees, lehengas and other ethnic outfits.",
      "Wear it with traditional outfits for {e1} and {e2}.",
      "It adds a traditional accent to braids, buns and festive hairstyles.",
      "It is a versatile hair accessory for {e1}, {e2} and other celebrations.",
      "The piece finishes a traditional hairstyle without extra accessories.",
      "It works well for {e1}, {e2} and festive family functions.",
      "The design adds a traditional touch to both simple and elaborate hairstyles.",
    ],
  },
  centre: {
    colour: [
      "The {c} crystals add a bright accent to braids and buns.",
      "The {c} finish gives the centre clip a traditional look for {e1} and {e2}.",
      "It adds {c} tones to braids, half-up styles and festive hairstyles.",
      "The {c} stones catch the light and lift the hairstyle for {e1}.",
      "Its {c} tones pair easily with sarees, lehengas and other ethnic outfits.",
      "The {c} detailing gives the clip a traditional finish for {e1}, {e2} and other celebrations.",
      "The {c} crystals stand out against traditional hairstyles at {e1}.",
      "It brings {c} tones to braids and buns for {e1} and {e2}.",
      "The {c} finish keeps the clip traditional while adding a festive sparkle.",
    ],
    plain: [
      "Clip it into a braid or half-up style for {e1}, {e2} and {e3}.",
      "It is an easy way to finish a traditional hairstyle without a full accessory set.",
      "The design adds a traditional accent to braids, buns and festive hairstyles.",
      "It works well for {e1}, {e2} and other celebrations.",
      "Use it to add a decorative finish to jada styling and festive outfits.",
      "It pairs easily with sarees, lehengas and other ethnic outfits.",
      "The compact clip sits neatly over a braid for {e1} and {e2}.",
      "The design works for both simple and elaborate traditional hairstyles.",
      "It adds a traditional finish to braids and half-up styles.",
      "The clip is an easy way to dress up a festive hairstyle.",
    ],
  },
  brooch: {
    colour: [
      "Pin it on {o1}, {o2} or {o3} for a quick traditional accent.",
      "The {c} finish adds a traditional accent to saree blouses and dupattas.",
      "It works well for {e1}, {e2} and {e3}, and adds a traditional accent to festive and dressy outfits.",
      "The {c} tones pair easily with ethnic wear and dressy outfits.",
      "Use it to add a touch of {c} to sarees, kurtas and festive layers.",
      "The {c} detailing gives the brooch a traditional finish for {e1} and {e2}.",
      "The {c} shade stands out against plain fabrics at {e1} and {e2}.",
      "Its {c} tones bring an accent to {o1}, {o2} and festive outfits.",
    ],
    plain: [
      "Pin it on {o1}, {o2} or {o3} for a quick traditional accent.",
      "The {motif} design adds a traditional accent to {o1}, {o2} and festive layers.",
      "It works well for {e1}, {e2} and {e3}, and adds a traditional accent to festive and dressy outfits.",
      "Its compact design makes it easy to place on collars, shoulders and festive layers.",
      "Use it to add a decorative finish to sarees, kurtas and festive layers.",
      "It is a simple way to add a traditional accent without a full jewellery set.",
      "The {motif} shape gives the brooch a traditional finish for {e1} and {e2}.",
      "The piece works on both simple and dressy outfits for {e1} and {e2}.",
      "Its {motif} detailing stands out on plain fabrics at {e1} and {e2}.",
      "The brooch adds a traditional touch to {o1}, {o2} and other traditional outfits.",
      "It is an easy finishing piece for {e1}, {e2} and family gatherings.",
      "The {motif} design makes it a versatile accent for {o1} and {o2}.",
    ],
  },
  jada: {
    colour: [
      "The {c} detailing adds a traditional accent to long braids and jada styles.",
      "It completes a jada braid with {c} tones for {e1} and {e2}.",
      "The {c} palette keeps the jada look traditional for {e1} and {e2}.",
      "Its {c} tones pair easily with silk sarees and lehengas at {e1} and {e2}.",
    ],
    plain: [
      "It completes a traditional jada braid for {e1}, {e2} and {e3}.",
      "Use it as the finishing piece for bridal and festive hairstyles.",
      "It is an easy way to finish a jada hairstyle for {e1} and {e2}.",
      "The piece works well for {e1}, {e2} and classical dance performances.",
      "The design adds a traditional accent to bridal jada styling.",
      "It pairs easily with silk sarees and lehengas at {e1} and {e2}.",
      "The {motif} detailing completes the jada look for {e1} and {e2}.",
      "It is a traditional finishing piece for {e1}, {e2} and family gatherings.",
      "The piece works for {e1}, {e2} and other traditional celebrations.",
      "It is an easy way to finish a festive hairstyle.",
      "The design brings a classic touch to traditional styling.",
      "It pairs easily with silk sarees and lehengas for {e1} and {e2}.",
    ],
  },
};

const SHORT_SENTENCES = {
  shared: [
    "It is a simple, traditional piece for festive wear.",
    "The design is easy to pair with ethnic outfits.",
    "It works well as part of a festive bangle stack.",
  ],
  glass: [
    "It is an easy festive choice.",
    "The set works for both daily and occasional wear.",
    "It adds a traditional touch to the look.",
  ],
  hair: [
    "It is a simple finishing piece for traditional hairstyles.",
    "It adds a traditional touch to the hairstyle.",
    "It is easy to pair with ethnic outfits.",
  ],
  centre: [
    "It is an easy way to finish a festive hairstyle.",
    "It adds a traditional touch to the style.",
    "It works with both simple and elaborate hairstyles.",
  ],
  brooch: [
    "It is an easy finishing touch for festive outfits.",
    "It adds a traditional accent to the outfit.",
    "It works on both simple and dressy outfits.",
  ],
  jada: [
    "It is a traditional finishing piece.",
    "It completes the jada look.",
    "It adds a classic touch to the hairstyle.",
  ],
};

const COLOUR_ALIASES = {
  marron: "maroon",
  skyblue: "sky blue",
  "dark skyblue": "dark sky blue",
  "candy skyblue": "candy sky blue",
  gray: "grey",
  golden: "gold",
  "pista": "pista green",
};

const IGNORED_COLOURS = new Set(["glass", "multi shade", "muti", "mix"]);

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normaliseColour(value) {
  const clean = value.trim().toLowerCase().replace(/\s+/g, " ");
  return COLOUR_ALIASES[clean] ?? clean;
}

function uniqueColours(product) {
  const seen = new Set();
  const result = [];
  for (const raw of product.colours ?? []) {
    const colour = normaliseColour(raw);
    if (!colour || IGNORED_COLOURS.has(colour) || seen.has(colour)) continue;
    seen.add(colour);
    result.push(colour);
  }
  return result;
}

function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function mentionedIn(phrase, description) {
  const text = description.toLowerCase();
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 4)
    .some((word) => text.includes(word.replace(/s$/, "")));
}

function pickDistinct(items, count, seed) {
  const picked = [];
  const length = items.length;
  for (let i = 0; i < length && picked.length < count; i += 1) {
    const item = items[(seed + i) % length];
    if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}

function arrange(preferred, full, count, seed) {
  const pool = [...preferred];
  for (let i = 0; i < full.length && pool.length < count; i += 1) {
    const item = full[(seed + i) % full.length];
    if (!pool.includes(item)) pool.push(item);
  }
  const result = [];
  for (let i = 0; i < pool.length && result.length < count; i += 1) {
    const item = pool[(seed + i) % pool.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function appendTo(base, addition) {
  const trimmed = base.trim();
  return `${trimmed.replace(/[.?!]+$/, "")}. ${addition}`.replace(/\s+/g, " ").trim();
}

function motifFor(name) {
  const lower = name.toLowerCase();
  const patterns = [
    [/ganesh|ganesha/, "Ganesha"],
    [/lakshmi|laksmi/, "Lakshmi"],
    [/lotus|thamarai|senthamarai|venthamarai|pangajam|mulari|manjari/, "lotus"],
    [/parrot|kili/, "parrot"],
    [/peacock|mayil/, "peacock"],
    [/coin|kasu/, "coin"],
    [/flower|floral|petal/, "flower"],
    [/crystal/, "crystal"],
    [/kundan/, "kundan"],
    [/leaf|leaves/, "leaf"],
    [/star/, "star"],
    [/moon/, "moon"],
    [/pearl/, "pearl"],
    [/jasmine/, "jasmine"],
    [/marigold|marygold/, "marigold"],
    [/raindrop/, "raindrop"],
    [/yazhi/, "Yazhi"],
    [/hamsa/, "hamsa"],
    [/diamond|dimond/, "diamond"],
    [/stone/, "stone"],
  ];
  const found = [];
  for (const [pattern, label] of patterns) {
    if (pattern.test(lower) && !found.includes(label)) found.push(label);
  }
  if (found.length === 0) return "traditional";
  if (found.length === 1) return found[0];
  return `${found[0]} and ${found[1]}`;
}

function buildDescription(product, category, base) {
  const copy = CATEGORY_COPY[category?.slug] ?? CATEGORY_COPY["border-bangles"];
  const seed = hash(`${product.sku}|${base}`);

  const outfits = arrange(
    copy.outfits.filter((item) => !mentionedIn(item, base)),
    copy.outfits,
    3,
    seed,
  );
  const occasions = arrange(
    copy.occasions.filter((item) => !mentionedIn(item, base)),
    copy.occasions,
    3,
    seed + 7,
  );

  const allColours = uniqueColours(product);
  const colourAdj =
    allColours.length > 0 && allColours.length <= 4 ? joinList(allColours) : null;
  const motif = motifFor(product.name);

  const values = {
    c: colourAdj ?? "",
    motif,
    type: copy.type,
    plural: copy.plural,
    o1: outfits[0],
    o2: outfits[1] ?? outfits[0],
    o3: outfits[2] ?? outfits[0],
    e1: occasions[0],
    e2: occasions[1] ?? occasions[0],
    e3: occasions[2] ?? occasions[0],
  };

  const style = TEMPLATES[copy.style] ?? TEMPLATES.shared;
  const pool = colourAdj ? style.colour : style.plain;
  const candidates = pickDistinct(pool, pool.length, seed);

  let best = null;
  let bestWords = 0;
  for (const template of candidates) {
    const sentence = fillTemplate(template, values);
    if (!sentence.trim()) continue;
    const combined = appendTo(base, sentence);
    const words = countWords(combined);
    if (words >= TARGET_MIN && words <= TARGET_MAX) {
      return { text: combined, words };
    }
    if (words > bestWords) {
      best = combined;
      bestWords = words;
    }
  }

  let text = best ?? base;
  let words = bestWords || countWords(text);
  if (words < TARGET_MIN) {
    const shortPool = SHORT_SENTENCES[copy.style] ?? SHORT_SENTENCES.shared;
    text = appendTo(text, shortPool[seed % shortPool.length]);
    words = countWords(text);
  }
  return { text, words };
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const categoryById = new Map(catalog.categories.map((category) => [category.id, category]));

  const review = [];
  const descriptions = {};
  let updated = 0;
  let leftLong = 0;

  for (const product of catalog.products) {
    const original = (product.description ?? "").trim();
    const base = OVERRIDES[product.sku] ?? original;
    const category = categoryById.get(product.category_id);
    const before = countWords(base);

    let final = base;
    if (before < TARGET_MIN) {
      final = buildDescription(product, category, base).text;
      updated += 1;
    } else if (before > TARGET_MAX) {
      leftLong += 1;
    }

    product.description = final;
    descriptions[product.sku] = final;
    review.push(
      [
        `[${product.sku}] ${product.name}`,
        `category: ${category?.slug ?? "unknown"} | words: ${countWords(final)} | sentences: ${
          final.split(/(?<=[.!?])\s+/).filter(Boolean).length
        }`,
        final,
        "",
      ].join("\n"),
    );
  }

  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  fs.writeFileSync(DESCRIPTIONS_PATH, `${JSON.stringify(descriptions, null, 2)}\n`, "utf8");
  fs.writeFileSync(REVIEW_PATH, review.join("\n"), "utf8");

  const counts = catalog.products.map((product) => countWords(product.description));
  const under = counts.filter((count) => count < TARGET_MIN).length;
  const over = counts.filter((count) => count > TARGET_MAX).length;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const average = (counts.reduce((sum, count) => sum + count, 0) / counts.length).toFixed(1);

  console.log(`Products: ${catalog.products.length}`);
  console.log(`Expanded: ${updated}`);
  console.log(`Words min/avg/max: ${min}/${average}/${max}`);
  console.log(`Under ${TARGET_MIN}: ${under}`);
  console.log(`Over ${TARGET_MAX}: ${over}`);
  if (leftLong) console.log(`Left as-is (already long): ${leftLong}`);
  console.log(`Review file: ${REVIEW_PATH}`);
}

main();
