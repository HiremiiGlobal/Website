import type { NextConfig } from "next";

const legacyRoutes = ["employers", "talent", "sponsorship", "approach", "stories", "team", "contact", "privacy", "terms"];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      ...legacyRoutes.map((route) => ({
        source: `/${route}.html`,
        destination: `/${route}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
