import sharp from "sharp";

/**
 * Generates the neutral catalogue placeholder used wherever a product has no
 * photograph (the legacy site never published an image for BNG-146). Drawn as
 * a font-free line illustration of a bangle so it renders identically on every
 * machine.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#f7e8df"/>
  <g fill="none" stroke="#c8956c" stroke-width="6" opacity="0.9">
    <circle cx="400" cy="400" r="200"/>
    <circle cx="400" cy="400" r="170"/>
    <circle cx="400" cy="400" r="150"/>
  </g>
  <g fill="#c8956c" opacity="0.55">
    <circle cx="400" cy="180" r="12"/>
    <circle cx="400" cy="620" r="12"/>
    <circle cx="180" cy="400" r="12"/>
    <circle cx="620" cy="400" r="12"/>
  </g>
  <rect x="0" y="0" width="800" height="800" fill="none" stroke="#eec9b4" stroke-width="2"/>
</svg>`;

const buffer = Buffer.from(svg);

const jpg = await sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile("public/images/placeholder.jpg");
console.log("placeholder.jpg", jpg.width, "x", jpg.height, jpg.size, "bytes");

const og = await sharp({
  create: { width: 1200, height: 630, channels: 3, background: "#1a1614" },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
          <rect width="1200" height="630" fill="#1a1614"/>
          <g fill="none" stroke="#c8956c" stroke-width="3" opacity="0.5">
            <circle cx="600" cy="300" r="150"/>
            <circle cx="600" cy="300" r="128"/>
          </g>
          <rect x="0" y="0" width="1200" height="8" fill="#c8956c"/>
        </svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile("public/images/og-default.jpg");
console.log("og-default.jpg", og.width, "x", og.height, og.size, "bytes");
