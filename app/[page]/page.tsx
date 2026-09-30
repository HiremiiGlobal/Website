import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/LegacyPage";

const pages = {
  employers: { fileName: "employers.html", title: "Employers" },
  talent: { fileName: "talent.html", title: "Professionals" },
  sponsorship: { fileName: "sponsorship.html", title: "Employer Sponsorship" },
  approach: { fileName: "approach.html", title: "Our Approach" },
  stories: { fileName: "stories.html", title: "Case Experience" },
  team: { fileName: "team.html", title: "Our Team" },
  contact: { fileName: "contact.html", title: "Contact" },
  privacy: { fileName: "privacy.html", title: "Privacy" },
  terms: { fileName: "terms.html", title: "Terms of Use" },
} as const;

type PageSlug = keyof typeof pages;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return { title: page in pages ? pages[page as PageSlug].title : "AQYR Global Service" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!(page in pages)) notFound();
  return <LegacyPage fileName={pages[page as PageSlug].fileName} />;
}
