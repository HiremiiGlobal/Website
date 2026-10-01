import type { Metadata } from "next";
import Script from "next/script";
import "../style.css";
import { brandName, organizationDescription, shareImage, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/aqyr-github-avatar.svg",
    apple: "/aqyr-github-avatar.png",
  },
  title: {
    default: "AQYR Global Service",
    template: "%s | AQYR Global Service",
  },
  description:
    "Australian visa, employer sponsorship and workforce support from AQYR Global Service, a subsidiary of AQYR.",
  openGraph: { type: "website", siteName: brandName, title: brandName,
    url: siteUrl, locale: "en_AU", images: [shareImage] },
  twitter: { card: "summary_large_image", title: brandName,
    images: [{ url: shareImage.url, alt: shareImage.alt }] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-lang="en" suppressHydrationWarning>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: brandName,
              url: siteUrl, description: organizationDescription,
              logo: `${siteUrl}/aqyr-logo.svg`, email: "info@hiremiiglobal.com",
              parentOrganization: { "@type": "Organization", name: "AQYR", url: "https://aqyr.ai" } },
            { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: brandName, url: siteUrl,
              inLanguage: ["en", "zh-Hans"], publisher: { "@id": `${siteUrl}/#organization` } },
          ],
        }).replace(/</g, "\\u003c") }} />
        <Script src="/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
