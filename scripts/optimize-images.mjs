import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAW = path.resolve(process.cwd(), "audit", "raw-images");
const OUT = path.resolve(process.cwd(), "public", "images");

const LIMITS = {
  products: 1100,
  banners: 2200,
  lifestyle: 1600,
  brand: 1200,
};

async function walk(dir) {
  const out = [];
  for (const e of await fs.promises.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = (await walk(RAW)).filter((f) => !f.endsWith(".ico"));
let done = 0;
let before = 0;
let after = 0;

async function work(file) {
  const rel = path.relative(RAW, file);
  const top = rel.split(path.sep)[0];
  const dest = path.join(OUT, rel);
  const limit = LIMITS[top] ?? 1000;
  const srcSize = fs.statSync(file).size;
  before += srcSize;

  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    after += fs.statSync(dest).size;
    done++;
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const isPng = file.endsWith(".png");
  const img = sharp(file, { failOn: "none" });
  const meta = await img.metadata();

  let pipeline = img.rotate();
  if (Math.max(meta.width ?? 0, meta.height ?? 0) > limit) {
    pipeline = pipeline.resize({ width: limit, height: limit, fit: "inside", withoutEnlargement: true });
  }

  if (isPng && top === "brand") {
    const buf = await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer();
    fs.writeFileSync(dest, buf);
    after += buf.length;
  } else {
    const buf = await pipeline
      .jpeg({ quality: top === "products" ? 80 : 84, progressive: true, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toBuffer();
    const finalDest = dest.replace(/\.(png|jpeg|jpg|webp)$/i, ".jpg");
    fs.writeFileSync(finalDest, buf);
    after += buf.length;
    if (finalDest !== dest && fs.existsSync(dest)) fs.unlinkSync(dest);
  }
  done++;
  if (done % 25 === 0) console.log(`${done}/${files.length}`);
}

await Promise.all(files.map((f) => work(f).catch((e) => console.log("ERR", f, e.message))));

console.log(`\noptimized ${done}/${files.length}`);
console.log(`before: ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`after:  ${(after / 1024 / 1024).toFixed(1)} MB`);

// write manifest mapping rel path -> dims
const manifest = {};
for (const f of await walk(OUT)) {
  const rel = path.relative(OUT, f).replace(/\\/g, "/");
  const m = await sharp(f, { failOn: "none" }).metadata();
  manifest[rel] = { w: m.width, h: m.height, kb: Math.round(fs.statSync(f).size / 1024) };
}
fs.writeFileSync("audit/image-manifest.json", JSON.stringify(manifest, null, 2));
console.log("manifest written:", Object.keys(manifest).length, "images");
