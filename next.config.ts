import type { NextConfig } from "next";

const legacyRoutes = ["employers", "talent", "sponsorship", "approach", "stories", "team", "contact", "privacy", "terms"];

const nextConfig: NextConfig = {
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
