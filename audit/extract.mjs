import fs from "node:fs";

const dir = process.cwd().replace(/\\/g, "/") + "/";

function decode(s) {
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xD;/g, "\r")
    .replace(/&#xA;/g, "\n")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/\s+/g, " ")
    .trim();
}

function attrs(tag) {
  const out = {};
  const re = /([a-zA-Z-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(tag))) out[m[1]] = decode(m[2]);
  return out;
}

function extractCards(html) {
  const cards = [];
  const chunks = html.split(/<div class="product-card/).slice(1);
  for (const chunk of chunks) {
    const headEnd = chunk.indexOf(">");
    const outer = attrs(chunk.slice(0, headEnd));
    const wrapIdx = chunk.indexOf('class="product-img-wrap');
    if (wrapIdx < 0) continue;
    const wrapStart = chunk.lastIndexOf("<", wrapIdx);
    const wrapTagEnd = chunk.indexOf(">", wrapIdx);
    const wrap = attrs(chunk.slice(wrapStart, wrapTagEnd + 1));
    const imgMatch = chunk.slice(wrapTagEnd, wrapTagEnd + 600).match(/<img[^>]*src="([^"]*)"/);
    const bodyStart = chunk.indexOf('class="product-body');
    const bodyHtml = bodyStart > 0 ? chunk.slice(bodyStart, bodyStart + 1500) : "";
    const codeMatch = decode(bodyHtml.replace(/<[^>]+>/g, " ")).match(/Code:\s*([A-Za-z0-9-]+)/);
    cards.push({
      id: wrap["data-id"] || outer["data-id"] || null,
      name: wrap["data-name"] || outer["data-name"] || "",
      price: wrap["data-price"] || outer["data-price"] || "",
      category: wrap["data-cat"] || outer["data-cat"] || "",
      description: wrap["data-desc"] || outer["data-desc"] || "",
      image: wrap["data-img"] || (imgMatch ? imgMatch[1] : ""),
      sku: codeMatch ? codeMatch[1] : null,
      detailHref: (chunk.slice(0, 900).match(/href="([^"]+)"/) || [])[1] || null,
    });
  }
  return cards;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
const byId = new Map();
for (const f of files) {
  const html = fs.readFileSync(dir + f, "utf8");
  const cards = extractCards(html);
  console.log(`${f}: ${cards.length} cards`);
  for (const c of cards) {
    const key = c.id || c.sku || c.name;
    const prev = byId.get(key);
    if (!prev) byId.set(key, { ...c, sources: [f] });
    else {
      prev.sources.push(f);
      if (!prev.description && c.description) prev.description = c.description;
      if (!prev.sku && c.sku) prev.sku = c.sku;
      if (!prev.image && c.image) prev.image = c.image;
    }
  }
}

const products = [...byId.values()];
const cats = {};
for (const p of products) cats[p.category] = (cats[p.category] || 0) + 1;
console.log("\nTOTAL UNIQUE:", products.length);
console.log(cats);
fs.writeFileSync(dir + "products.json", JSON.stringify(products, null, 2));
