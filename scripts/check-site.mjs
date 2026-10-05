import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = process.argv[2] || "http://127.0.0.1:3000";
const routes = ["", "about", "employers", "talent", "sponsorship", "approach",
  "stories", "team", "contact", "privacy", "terms"];
const assets = new Set();
const titles = new Set();
const descriptions = new Set();
const packageInfo = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
assert.equal(packageInfo.name, "aqyr-global-services", "Application package name must be plural");
const readme = await readFile(resolve(root, "README.md"), "utf8");
assert.match(readme, /^# AQYR Global Services\r?$/m, "README company name must be plural");
assert.doesNotMatch(readme, /\bAQYR Global Service\b/i);
for (const route of routes) {
  const response = await fetch(base + "/" + route);
  assert.equal(response.status, 200, route + " must load");
  const html = await response.text();
  assert.doesNotMatch(html, /你/, "Chinese copy uses polite address: " + route);
  assert.doesNotMatch(html, /Official guidance checked on|官方指引核对日期|Last updated:|最后更新：/, "No public editorial date labels: " + route);
  assert.match(html, /<title>[^<]*AQYR Global Services/);
  assert.doesNotMatch(html, /\bAQYR Global Service\b/, "Company name must be plural: " + route);
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
    .find((entry) => entry["@type"] === "Organization" && entry.name === "AQYR Global Services");
  assert(organization, "Company schema: " + route);
  assert.equal(organization.parentOrganization?.name, "AQYR");
  assert.equal(organization.parentOrganization?.url, "https://aqyr.ai");
  assert.match(organization.description, /subsidiary of AQYR/);
  assert.equal(organization.legalName, "HIREMII GLOBAL SERVICES PTY LTD");
  assert.equal(organization.taxID, "23619566040");
  assert.deepEqual(organization.identifier.map(({ propertyID, value }) => [propertyID, value]),
    [["ABN", "23619566040"], ["ACN", "619566040"]]);
  assert(organization.sameAs.includes("https://abr.business.gov.au/ABN/View?abn=23619566040"));
  const graph = schema.flatMap((entry) => entry["@graph"] || [entry]);
  const agent = graph.find((entry) => entry["@id"] === organization.employee["@id"]);
  assert.equal(agent?.["@type"], "Person");
  assert.equal(agent.name, "Yuan Gao");
  assert.equal(agent.alternateName, "Leon Gao");
  assert.equal(agent.worksFor["@id"], organization["@id"]);
  assert.deepEqual(agent.identifier, { "@type": "PropertyValue", propertyID: "MARN", value: "1793302" });
  assert(agent.sameAs.some((url) => url.startsWith("https://portal.mara.gov.au/")));
  const offices = organization.location.map((ref) => graph.find((entry) => entry["@id"] === ref["@id"]));
  assert.equal(offices.length, 3);
  assert.deepEqual(offices.map((office) => office?.address.addressCountry), ["AU", "AU", "CN"]);
  assert.equal(organization.address.postalCode, "3128");
  assert.deepEqual(offices[0].address, organization.address);
  assert.match(html, /property="og:title" content="AQYR Global Services"/);
  assert.match(html, /property="og:image" content="https?:[^\"]*\/share-cover\.png"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image"/);
  assert.match(html, /id="main-content"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, "One main heading: " + route);
  const source = await readFile(resolve(root, "content", (route || "index") + ".html"), "utf8");
  assert.match(source, /data-en="Global Services"/);
  assert(!/src="https?:/i.test(source), "Images must be hosted locally: " + route);
  assert(!/[↗→↔]/u.test(source), "No emoji-prone text arrows: " + route);
  assert(!/再次确认|待审核|generated portraits|reconfirm roles/i.test(source));
  assert.match(source, /data-en="Individuals &amp; Visas" data-zh="个人与签证服务"/);
  assert.match(source, /A subsidiary of AQYR\./);
  assert.match(source, /AQYR 旗下子公司。/);
  assert(!source.includes("Part of the AQYR group."), "Explicit subsidiary relationship: " + route);
  assert.match(source, /href="\/about"/, "Company introduction link: " + route);
  const primaryNavigation = source.match(/<nav class="nav"[\s\S]*?<\/nav>/)?.[0];
  assert(primaryNavigation && !primaryNavigation.includes('href="/about"'), "Company introduction remains footer-only: " + route);
  const compliance = source.match(/<div class="footer-compliance">([\s\S]*?)<\/div>/)?.[1];
  assert(compliance, "Low-key registration details on every page: " + route);
  assert.match(compliance, /ABN 23 619 566 040/);
  assert.match(compliance, /ACN 619 566 040/);
  assert.match(compliance, /MARN 1793302/);
  assert.match(compliance, /Yuan \(Leon\) Gao/);
  assert.match(compliance, /portal\.mara\.gov\.au/);
  assert.match(compliance, /abr\.business\.gov\.au/);
  if (route === "about") {
    assert.match(source, /Prince Migration/);
    assert.match(source, /2017/);
    assert.match(source, /Hiremii Global Services/);
    assert.match(source, /Hiremii Limited \(ASX:HMI\)/);
    assert.match(source, /not a separately listed company/);
    assert.match(source, /HIREMII GLOBAL SERVICES PTY LTD/);
    assert.match(source, /class="section legal-section company-profile"/);
    assert.match(source, /id="company-registration"/);
    assert(!/knowledge graph|AI-powered recruitment platform/i.test(source));
  }
  if (route === "stories") {
    assert.equal((source.match(/class="case-study case-detailed reveal"/g) || []).length, 7);
    assert.equal((source.match(/class="section project-cases"/g) || []).length, 1);
    assert(!/data-zh="历史案例"|SELECTED EXPERIENCE/.test(source), "Cases must share one presentation, not history/experience sections");
    assert.deepEqual([...source.matchAll(/data-case-audience="([^"]+)"/g)].map(([, audience]) => audience),
      ["business", "business", "business", "business", "individual", "individual", "individual"],
      "Business cases must precede individual cases");
    for (const [, article] of source.matchAll(/<article class="case-study case-detailed reveal"[^>]*>([\s\S]*?)<\/article>/g)) {
      assert.match(article, /class="case-context"/);
      assert.match(article, /class="case-work"/);
      assert.match(article, /class="case-outcome"/);
    }
    assert.match(source, /Some examples draw on the work of our predecessor, Hiremii Global Services/);
    assert.match(source, /id="historical-cases"/, "Keep earlier case links working");
    assert.match(source, /Nomination approved without a further information request/);
    assert.match(source, /not a visa grant/);
    assert(!/Novatti|Sequoia|HealthLink|Crosstec|AUDD|\$82K|\$105K/i.test(source));
  }
  if (route === "team") assert.match(source, /AQYR Global Services is a subsidiary of AQYR\./);
  if (route === "sponsorship") {
    for (const id of ["sponsorship-stages", "482-requirements", "186-de-requirements",
      "186-trt-requirements", "employer-documents"]) {
      assert(source.includes('class="faq-item" id="' + id + '"'), "Practical sponsorship FAQ: " + id);
    }
    assert.match(source, /core-skills-stream/);
    assert.match(source, /direct-entry-stream/);
    assert.match(source, /temporary-residence-transition-stream/);
  }
  if (route === "talent") {
    for (const id of ["visitor-visas", "student-visas", "skilled-visas", "partner-family-visas"]) {
      const block = source.match(new RegExp('<details[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)</details>'))?.[1];
      assert(block, "Individual visa guide: " + id);
      for (const heading of ["When to get in touch", "How we can help", "Before our first conversation"]) {
        assert(block.includes('data-en="' + heading + '"'), id + ": " + heading);
      }
      assert.match(block, /data-zh=/);
      assert.match(block, /https:\/\/immi\.homeaffairs\.gov\.au\//);
      assert.match(block, /href="\/contact\?service=/);
    }
  }
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
assert.doesNotMatch(script, /你/, "Runtime Chinese copy uses polite address");
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
console.log(`PASS: ${routes.length} pages, unique search metadata, company introduction, 7 unified case studies with businesses before individuals, subsidiary relationship, branded share image, navigation, redirects, sitemap, robots, responsive local images and shared runtime.`);
