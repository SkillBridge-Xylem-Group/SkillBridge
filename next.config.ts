import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security/headers";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
  devIndicators: false,
  // Keep soft-navigated dashboard pages in the client router cache so switches
  // feel like a SPA (Reddit-style) instead of refetching RSC every click.
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
