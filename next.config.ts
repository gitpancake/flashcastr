import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
