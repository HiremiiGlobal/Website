import type { Metadata } from "next";

// Set this to the final public domain when the domain is connected.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://website-demo-blush-beta.vercel.app",
).origin;
export const brandName = "AQYR Global Service";
export const shareImage = {
  url: `${siteUrl}/share-cover.png`,
  width: 1200,
  height: 630,
  alt: "AQYR Global Service company logo",
  type: "image/png",
};
export const pages = {
  employers: { fileName: "employers.html", title: "Employer Solutions", description: "Workforce planning, talent connections and employer sponsorship support for Australian businesses, including 482 and 186 matters." },
  talent: { fileName: "talent.html", title: "Individuals & Visas", description: "Employer connections and Australian visa support for individuals: sponsored work, visitor, student, skilled, partner and complex matters." },
  sponsorship: { fileName: "sponsorship.html", title: "482 & 186 Employer Sponsorship", description: "Understand 482 Skills in Demand and 186 Direct Entry and TRT pathways, preparation and coordinated support for employers and applicants." },
  approach: { fileName: "approach.html", title: "Our Approach", description: "From initial assessment and an agreed scope to document preparation and ongoing communication: how our advisory team supports your matter." },
  stories: { fileName: "stories.html", title: "Case Experience", description: "Experience from 200+ employer-sponsored cases across 482 and 186: employer and role assessment, nomination preparation and coordinated visa support." },
  team: { fileName: "team.html", title: "Our Team", description: "Meet the AQYR Global Service team across migration, legal services, compliance and client delivery, led by Leon Gao with over ten years of experience." },
  contact: { fileName: "contact.html", title: "Contact", description: "Contact AQYR Global Service in Melbourne, Perth or Shanghai about recruitment, employer sponsorship, Australian visas and complex matters." },
  privacy: { fileName: "privacy.html", title: "Privacy Policy", description: "How AQYR Global Service handles information when you visit our website or contact our team." },
  terms: { fileName: "terms.html", title: "Terms of Use", description: "Terms for using the AQYR Global Service website, including information, enquiries and professional services." },
} as const;
export type PageSlug = keyof typeof pages;
export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  const fullTitle = `${title} | ${brandName}`;
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: `${siteUrl}${pathname}` },
    openGraph: { type: "website", siteName: brandName, title: brandName, description,
      url: `${siteUrl}${pathname}`, locale: "en_AU", images: [shareImage] },
    twitter: { card: "summary_large_image", title: brandName, description,
      images: [{ url: shareImage.url, alt: shareImage.alt }] },
  };
}
