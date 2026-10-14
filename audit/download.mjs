import fs from "node:fs";
import path from "node:path";

const BASE = "https://banglesbybeauty.com";
const OUT = path.resolve(process.cwd(), "..", "public", "images");
const products = JSON.parse(fs.readFileSync("products.json", "utf8"));

const extra = [
  ["/Images/logo.png", "brand/logo.png"],
  ["/Images/13.jpg", "banners/hero-13.jpg"],
  ["/images/18.jpg", "lifestyle/18.jpg"],
  ["/Images/51.jpg", "lifestyle/51.jpg"],
  ["/Images/53.jpg", "lifestyle/53.jpg"],
  ["/Images/54.jpeg", "lifestyle/54.jpeg"],
  ["/favicon.ico", "brand/favicon.ico"],
];

function ext(u, fallback = ".jpg") {
  const m = u.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i);
  return m ? "." + m[1].toLowerCase().replace("jpeg", "jpg") : fallback;
}
function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const jobs = [];
const seen = new Set();
for (const p of products) {
  if (!p.image) continue;
  const url = p.image.startsWith("http") ? p.image : BASE + p.image;
  const dest = path.join("products", `${slug(p.sku + "-" + p.name)}${ext(url)}`);
  jobs.push({ url, dest, sku: p.sku });
  seen.add(url);
}
for (const [u, d] of extra) {
  const url = u.startsWith("http") ? u : BASE + u;
  if (seen.has(url)) continue;
  jobs.push({ url, dest: d });
  seen.add(url);
}

const results = [];
let i = 0;
async function worker() {
  while (i < jobs.length) {
    const j = jobs[i++];
    const target = path.join(OUT, j.dest);
    try {
      if (fs.existsSync(target) && fs.statSync(target).size > 0) {
        results.push({ ...j, status: "cached" });
        continue;
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const res = await fetch(j.url, { headers: { "user-agent": "Mozilla/5.0 asset-migration" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) throw new Error("too small " + buf.length);
      fs.writeFileSync(target, buf);
      results.push({ ...j, status: "ok", bytes: buf.length });
    } catch (e) {
      results.push({ ...j, status: "fail", error: String(e.message) });
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const ok = results.filter((r) => r.status === "ok" || r.status === "cached");
const fail = results.filter((r) => r.status === "fail");
console.log(`downloaded/cached: ${ok.length}/${jobs.length}`);
console.log("failures:", fail.length);
fail.forEach((f) => console.log("  FAIL", f.url, f.error));
fs.writeFileSync("download-report.json", JSON.stringify(results, null, 2));
