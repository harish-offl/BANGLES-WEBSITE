import sharp from "sharp";
import { statSync } from "node:fs";

const src = "audit/raw-images/brand/logo.png";
const out = "public/images/brand/logo.png";

const meta = await sharp(src).metadata();
console.log("source", meta.width, "x", meta.height, meta.format, statSync(src).size, "bytes");

const info = await sharp(src)
  .resize(320, 320, { fit: "inside", withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(out + ".tmp.png");

console.log("logo ->", info.width, "x", info.height, info.size, "bytes");
