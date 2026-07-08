import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.unsplash.com" }],
  },
  devIndicators: false,
};

export default nextConfig;