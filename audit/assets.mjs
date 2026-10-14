import fs from "node:fs";

const h = fs.readFileSync("home.html", "utf8");
const imgs = [...h.matchAll(/(?:src|data-img|data-bg|href)=["']([^"']+\.(?:png|jpg|jpeg|webp|gif|svg|ico))["']/gi)].map((m) => m[1]);
const uniq = [...new Set(imgs)];
console.log("home images:", uniq.length);
uniq.filter((u) => !u.includes("/uploads/") || true).forEach((u) => console.log(u));

// inline CSS custom properties
const vars = [...h.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)];
console.log("\n--- CSS VARS ---");
for (const [, k, v] of vars) console.log(k, "=", v.trim());

// font families
console.log("\n--- FONT FAMILIES ---");
[...new Set([...h.matchAll(/font-family\s*:\s*([^;]+);/gi)].map((m) => m[1].trim()))].forEach((f) => console.log(f));
