import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

// Use the image processor bundled with Next; retain all original brand/photo assets.
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
const sharp = nextRequire("sharp");
const root = resolve(dirname(import.meta.filename), "..");
const logo = (await readFile(resolve(root, "public/aqyr-logo.svg"), "utf8"))
  .replace(/<svg\b[^>]*>/, '<svg x="300" y="165" width="600" height="160" viewBox="0 0 150 40">');
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fafbf8"/>
  ${logo}
  <text x="600" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="500" fill="#1f4434">AQYR Global Service</text>
</svg>`;
await sharp(Buffer.from(cover)).png().toFile(resolve(root, "public/share-cover.png"));
let originalBytes = 0, optimisedBytes = 0;
for (const file of await readdir(resolve(root, "public/team"))) {
  if (!file.endsWith(".jpg")) continue;
  const source = await readFile(resolve(root, "public/team", file));
  originalBytes += source.length;
  for (const width of [240, 480]) {
    const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 84 }).toFile(resolve(root, "public/team", file.replace(/\.jpg$/, `-${width}.webp`)));
    if (width === 480) optimisedBytes += result.size;
  }
}
console.log(`Prepared logo share cover and responsive portraits. Portrait bytes: ${originalBytes} -> ${optimisedBytes}.`);

const scenes = JSON.parse(await readFile(resolve(root, "assets/photography.json"), "utf8"));
let sceneBytes = 0;
for (const photo of scenes.photos) {
  const source = await readFile(resolve(root, "public/scenes", `${photo.name}.jpg`));
  for (const width of [640, 960, 1440]) {
    const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(resolve(root, "public/scenes", `${photo.name}-${width}.webp`));
    if (width === 960) sceneBytes += result.size;
  }
}
console.log(`Prepared ${scenes.photos.length} responsive editorial scenes (${sceneBytes} bytes at 960px).`);
