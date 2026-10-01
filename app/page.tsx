import type { Metadata } from "next";
import { LegacyPage } from "@/components/LegacyPage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "Workforce & Australian Visa Advisory",
  "Employer sponsorship, particularly 482 and 186 Direct Entry, alongside recruitment, other Australian visas and complex-case support.",
  "/",
);

export default function HomePage() {
  return <LegacyPage fileName="index.html" />;
}
