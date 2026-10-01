import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// The deployed source is content/*.html. Root HTML files are local static previews.
const root = resolve(import.meta.dirname, "..");
const files = ["index", "employers", "talent", "sponsorship", "approach",
  "stories", "team", "contact", "privacy", "terms"];
for (const slug of files) {
  let source = await readFile(resolve(root, "content", slug + ".html"), "utf8");
  source = source.replace(/href="\/(employers|talent|sponsorship|approach|stories|team|contact|privacy|terms)([?#][^"]*)?"/g,
    (_, page, suffix = "") => `href="${page}.html${suffix}"`);
  source = source.replace(/href="\/"/g, 'href="index.html"')
    .replace(/href="\/style.css"/g, 'href="style.css"')
    .replace(/src="\/script.js"/g, 'src="script.js"')
    .replace(/src="\/(?!script.js)([^"]+)"/g, 'src="public/$1"');
  source = source.replace(/srcset="([^"]+)"/g, (_, candidates) =>
    `srcset="${candidates.replace(/(^|,\s*)\//g, '$1public/')}"`);
  await writeFile(resolve(root, slug + ".html"), source);
}
await writeFile(resolve(root, "script.js"), await readFile(resolve(root, "public", "script.js")));
console.log("Updated ten static preview pages and their shared script.");
