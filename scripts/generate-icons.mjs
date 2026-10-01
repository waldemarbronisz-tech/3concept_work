// Generuje favicon i ikony PWA ze znaku marki: biały kwadrat, znak wyśrodkowany, margines ~12 %.
// Uruchamiane ręcznie (`node scripts/generate-icons.mjs`), wynik jest commitowany.
// Używa sharp dostarczanego przez Next.js — bez nowej zależności runtime.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const MARK = "public/brand/3concept-mark.png";
const MARGIN = 0.12;

const TARGETS = [
  { path: "src/app/icon.png", size: 64 }, // favicon (konwencja App Routera)
  { path: "src/app/apple-icon.png", size: 180 }, // apple-touch-icon
  { path: "public/icons/icon-192.png", size: 192 }, // manifest PWA (iteracja 6)
  { path: "public/icons/icon-512.png", size: 512 },
];

await mkdir("public/icons", { recursive: true });

for (const { path, size } of TARGETS) {
  const inner = Math.round(size * (1 - 2 * MARGIN));
  const mark = await sharp(MARK)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(path);
  console.log(`${path} ${size}×${size}`);
}
