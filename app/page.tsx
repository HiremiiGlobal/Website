import type { Metadata } from "next";
import { LegacyPage } from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Workforce & Mobility Advisory",
};

export default function HomePage() {
  return <LegacyPage fileName="index.html" />;
}
