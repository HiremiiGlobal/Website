import type { Metadata } from "next";
import Script from "next/script";
import "../style.css";

export const metadata: Metadata = {
  title: {
    default: "AQYR Global Service",
    template: "%s | AQYR Global Service",
  },
  description:
    "End-to-end workforce, talent and mobility advisory for employers and skilled professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-lang="en">
      <body>
        {children}
        <Script src="/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
