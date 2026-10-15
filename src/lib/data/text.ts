/**
 * The original catalogue was migrated from WordPress, so titles and
 * descriptions still contain HTML entities (`&#x20B9;`, `&#x2014;`, emoji
 * escapes, `&amp;`, …). They are stored as plain text, so they must be decoded
 * before they reach the UI — otherwise shoppers see the raw codes.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  copy: "©",
  reg: "®",
  trade: "™",
  times: "×",
  divide: "÷",
  deg: "°",
  middot: "·",
  bull: "•",
  rupee: "\u20B9",
};

/**
 * Decodes numeric (hex and decimal) and common named HTML entities. Unknown
 * entities are left untouched so nothing is silently lost.
 */
export function decodeHtmlEntities(value: string): string {
  if (!value || value.indexOf("&") === -1) return value;

  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity: string) => {
    if (entity.charCodeAt(0) === 35 /* # */) {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const LEGACY_PACK_PRICE =
  /\(?\s*pack\s+of\s+[\d,\s]*(?:pack\s+of\s+[\d,\s]*)*\)?\s*\(?\s*price\s+[^)]*\)?/i;

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Turns the raw migrated pack/price phrasing —
 * `(pack of 5, pack of 10, pack of 15) ( price &#x20B9;200,&#x20B9;400,&#x20B9;600)` —
 * into a readable sentence: `Available in packs of 5 (₹200), 10 (₹400) and 15 (₹600).`
 * Text that is already humanised, or that does not match the legacy shape, is
 * returned unchanged apart from entity decoding.
 */
export function normalizeDescription(value: string | null | undefined): string {
  const decoded = decodeHtmlEntities(value ?? "").trim();
  if (!decoded || /available in packs of/i.test(decoded)) return decoded;

  const packs = [...decoded.matchAll(/pack\s+of\s+(\d+)/gi)].map((m) => m[1]);
  const prices = [...decoded.matchAll(/₹\s*([\d,]+)/g)]
    .map((m) => m[1])
    .join(",")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (packs.length === 0 || packs.length !== prices.length) return decoded;

  const options = packs.map((size, i) => `${size} (₹${prices[i]})`);
  const sentence = `Available in packs of ${joinWithAnd(options)}.`;

  const remainder = decoded.replace(LEGACY_PACK_PRICE, "").replace(/[\s.]+$/g, "").trim();
  const tagged = `${sentence} Handcrafted with love from Pattukottai.`;
  if (!remainder) return tagged;

  return decoded
    .replace(LEGACY_PACK_PRICE, sentence)
    .replace(/\s{2,}/g, " ")
    .trim();
}
