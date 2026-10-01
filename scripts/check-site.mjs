import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = process.argv[2] || "http://127.0.0.1:3000";
const routes = ["", "employers", "talent", "sponsorship", "approach",
  "stories", "team", "contact", "privacy", "terms"];
const assets = new Set();
for (const route of routes) {
  const response = await fetch(base + "/" + route);
  assert.equal(response.status, 200, route + " must load");
  const html = await response.text();
  assert.match(html, /<title>[^<]*AQYR Global Service/);
  assert.match(html, /name="description"/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /id="main-content"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, "One main heading: " + route);
  const source = await readFile(resolve(root, "content", (route || "index") + ".html"), "utf8");
  assert(!/src="https?:/i.test(source), "Images must be hosted locally: " + route);
  assert(!/[↗→↔]/u.test(source), "No emoji-prone text arrows: " + route);
  assert(!/再次确认|待审核|generated portraits|reconfirm roles/i.test(source));
  for (const [, src] of source.matchAll(/<img[^>]*src="([^"]+)"/g)) assets.add(src);
  const alias = route ? "/" + route + ".html" : "/index.html";
  const redirect = await fetch(base + alias + "?service=sponsorship", { redirect: "manual" });
  assert.equal(redirect.status, 308, "Legacy URL redirect: " + alias);
  assert.equal(new URL(redirect.headers.get("location"), base).pathname, "/" + route);
  assert.equal(new URL(redirect.headers.get("location"), base).searchParams.get("service"), "sponsorship");
}
for (const src of assets) {
  await access(resolve(root, "public", src.replace(/^\//, "")));
  assert.equal((await fetch(base + src)).status, 200, "Asset: " + src);
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length);
assert(!sitemap.includes(".html"));
assert.match(await (await fetch(base + "/robots.txt")).text(), /Sitemap:/);
const script = await readFile(resolve(root, "public", "script.js"), "utf8");
assert.equal(script, await readFile(resolve(root, "script.js"), "utf8"), "Preview script must match deployed script");
assert.match(script, /mailto:info@hiremiiglobal.com/);
new Function(script);
console.log("PASS: ten pages, metadata, legacy redirects, sitemap, robots, local images and shared runtime.");
