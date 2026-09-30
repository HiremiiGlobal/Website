import type { NextConfig } from "next";

const legacyRoutes = ["employers", "talent", "approach", "stories", "team", "contact", "privacy", "terms"];

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/index.html", destination: "/" },
      ...legacyRoutes.map((route) => ({
        source: `/${route}.html`,
        destination: `/${route}`,
      })),
    ];
  },
};

export default nextConfig;
