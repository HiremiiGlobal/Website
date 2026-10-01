import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = process.argv[2] || "http://127.0.0.1:3000";
const routes = ["", "employers", "talent", "sponsorship", "approach",
  "stories", "team", "contact", "privacy", "terms"];
const assets = new Set();
const titles = new Set();
const descriptions = new Set();
for (const route of routes) {
  const response = await fetch(base + "/" + route);
  assert.equal(response.status, 200, route + " must load");
  const html = await response.text();
  assert.match(html, /<title>[^<]*AQYR Global Service/);
  assert.match(html, /name="description"/);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/name="description" content="([^"]+)"/)?.[1];
  assert(title && description, "Nonempty search metadata: " + route);
  titles.add(title);
  descriptions.add(description);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
  const schema = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const organization = schema.flatMap((entry) => entry["@graph"] || [entry])
    .find((entry) => entry["@type"] === "Organization" && entry.name === "AQYR Global Service");
  assert(organization, "Company schema: " + route);
  assert.equal(organization.parentOrganization?.name, "AQYR");
  assert.equal(organization.parentOrganization?.url, "https://aqyr.ai");
  assert.match(organization.description, /subsidiary of AQYR/);
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
  assert.match(source, /A subsidiary of AQYR\./);
  assert.match(source, /AQYR 旗下子公司。/);
  assert(!source.includes("Part of the AQYR group."), "Explicit subsidiary relationship: " + route);
  if (route === "team") assert.match(source, /AQYR Global Service is a subsidiary of AQYR\./);
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
assert.equal(titles.size, routes.length, "Every page has a unique search title");
assert.equal(descriptions.size, routes.length, "Every page has a unique search description");
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
console.log("PASS: ten pages, unique search metadata, subsidiary relationship, branded share image, navigation, redirects, sitemap, robots, responsive local images and shared runtime.");
