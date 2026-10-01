import type { MetadataRoute } from "next";
import { pages, siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...Object.keys(pages)].map((slug) => ({ url: `${siteUrl}/${slug}` }));
}
