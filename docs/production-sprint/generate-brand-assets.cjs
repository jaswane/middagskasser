// Regenerates the brand icons and the sharing image from one symbol definition:
// the open box (Lucide PackageOpen) used by the header logo, on the brand-blue tile.
// Run from anywhere: node docs/production-sprint/generate-brand-assets.cjs
const fs = require("node:fs");
const path = require("node:path");
process.chdir(path.join(__dirname, "../.."));
const sharp = require("../../node_modules/sharp");

const BLUE = "#304dcc";
// Lucide PackageOpen (lucide-react 0.468.0), 24×24 grid, same as <Brand /> in components/chrome.tsx.
const PACKAGE_OPEN = [
  "M12 22v-9",
  "M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z",
  "M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13",
  "M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z",
];

// A 64×64 tile. Small sizes use a larger symbol and heavier stroke so it
// holds up at 16–32 px; large sizes keep more padding and a lighter stroke.
function tile({ rx, scale, stroke }) {
  const offset = Number(((64 - 24 * scale) / 2).toFixed(2));
  const paths = PACKAGE_OPEN.map((d) => `<path d="${d}"/>`).join("");
  return (
    `${rx ? `<rect width="64" height="64" rx="${rx}" fill="${BLUE}"/>` : `<rect width="64" height="64" fill="${BLUE}"/>`}` +
    `<g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`
  );
}
const SMALL = { rx: 14, scale: 2.2, stroke: 2.5 };
const LARGE = { rx: 14, scale: 2, stroke: 2 };
// iOS applies its own corner mask, so the touch icon must be a full square.
const TOUCH = { rx: 0, scale: 2, stroke: 2 };
const icon = (spec) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${tile(spec)}</svg>`;

(async () => {
  const favicon = icon(SMALL);
  fs.writeFileSync("public/favicon.svg", favicon + "\n");
  await sharp(Buffer.from(favicon), { density: 288 })
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toFile("public/favicon-32.png");
  await sharp(Buffer.from(icon(TOUCH)), { density: 405 })
    .resize(180, 180)
    .flatten({ background: BLUE })
    .png({ compressionLevel: 9 })
    .toFile("public/apple-touch-icon.png");

  // Sharing image: unchanged layout; the brand tile at 70,76 (68×68) uses the same symbol.
  const og =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
    '<rect width="1200" height="630" fill="#fbfaf7"/>' +
    `<svg x="70" y="76" width="68" height="68" viewBox="0 0 64 64">${tile(LARGE)}</svg>` +
    '<text x="163" y="124" font-family="Arial" font-weight="700" font-size="36" fill="#182b2b">Middagskasser.no</text>' +
    '<text x="70" y="300" font-family="Georgia" font-size="76" fill="#182b2b">Hvilken matkasse</text>' +
    '<text x="70" y="395" font-family="Georgia" font-size="76" fill="#182b2b">passer dere?</text>' +
    `<text x="70" y="512" font-family="Arial" font-size="30" fill="${BLUE}">HelloFresh og Godtlevert · samme kriterier</text>` +
    "</svg>";
  await sharp(Buffer.from(og)).png().toFile("public/og.png");
  console.log(
    "Wrote favicon.svg, favicon-32.png, apple-touch-icon.png and og.png",
  );
})();
