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
  assert.match(html, /property="og:title" content="AQYR Global Service"/);
  assert.match(html, /property="og:image" content="https?:[^\"]*\/share-cover\.png"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image"/);
  assert.match(html, /id="main-content"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, "One main heading: " + route);
  const source = await readFile(resolve(root, "content", (route || "index") + ".html"), "utf8");
  assert(!/src="https?:/i.test(source), "Images must be hosted locally: " + route);
  assert(!/[↗→↔]/u.test(source), "No emoji-prone text arrows: " + route);
  assert(!/再次确认|待审核|generated portraits|reconfirm roles/i.test(source));
  assert.match(source, /data-en="Individuals &amp; Visas" data-zh="个人与签证服务"/);
  for (const [, src] of source.matchAll(/<img[^>]*src="([^"]+)"/g)) assets.add(src);
  for (const [, candidates] of source.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of candidates.split(",")) assets.add(candidate.trim().split(/\s+/)[0]);
  }
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
const coverResponse = await fetch(base + "/share-cover.png");
assert.equal(coverResponse.status, 200);
assert.match(coverResponse.headers.get("content-type"), /image\/png/);
const cover = Buffer.from(await coverResponse.arrayBuffer());
assert.equal(cover.subarray(1, 4).toString(), "PNG");
assert.equal(cover.readUInt32BE(16), 1200);
assert.equal(cover.readUInt32BE(20), 630);
console.log("PASS: ten pages, branded share metadata/image, navigation, redirects, sitemap, robots, responsive local images and shared runtime.");
