import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        // port: "",
        // pathname: "/images/**",
      },
    ],
    // You can add other options here, like deviceSizes, imageSizes, etc.
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;