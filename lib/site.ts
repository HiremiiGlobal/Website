import type { Metadata } from "next";

// Set this to the final public domain when the domain is connected.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://website-demo-blush-beta.vercel.app",
).origin;
export const brandName = "AQYR Global Service";
export const organizationDescription =
  "AQYR Global Service is a subsidiary of AQYR, providing Australian visa, employer sponsorship and workforce support for businesses and individuals.";
export const shareImage = {
  url: `${siteUrl}/share-cover.png`,
  width: 1200,
  height: 630,
  alt: "AQYR Global Service company logo",
  type: "image/png",
};
export const pages = {
  employers: { fileName: "employers.html", title: "Employer Sponsorship & Recruitment", description: "Recruitment and employer sponsorship support for Australian businesses, including workforce planning, 482 nominations and 186 visa matters." },
  talent: { fileName: "talent.html", title: "Australian Visa Services for Individuals", description: "Australian visa advice and application support for individuals, including sponsored work, visitor, student, skilled and partner visa matters." },
  sponsorship: { fileName: "sponsorship.html", title: "482 & 186 Direct Entry Visa Support", description: "Explore 482 Skills in Demand, 186 Direct Entry and TRT pathways, with employer nomination and visa preparation support for businesses and applicants." },
  approach: { fileName: "approach.html", title: "Our Visa & Sponsorship Support Process", description: "How we support visa and employer sponsorship matters: initial assessment, an agreed service scope, document preparation and ongoing communication." },
  stories: { fileName: "stories.html", title: "482 & 186 Sponsorship Case Experience", description: "Experience handling 200+ employer-sponsored cases across 482 and 186, covering employer assessment, nomination preparation and visa application support." },
  team: { fileName: "team.html", title: "Visa & Workforce Advisory Team", description: "Meet the migration, legal support and client service team at AQYR Global Service, a subsidiary of AQYR." },
  contact: { fileName: "contact.html", title: "Contact Our Visa & Workforce Team", description: "Contact our Melbourne, Perth or Shanghai team about Australian visas, 482 and 186 employer sponsorship, recruitment and complex visa matters." },
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
