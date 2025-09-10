import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow remote images used by dynamic fallbacks (Unsplash/Pexels)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "source.unsplash.com" },
      // In case absolute self-URLs are ever used
      { protocol: "https", hostname: "trendstoday.ca" },
      { protocol: "https", hostname: "www.trendstoday.ca" },
    ],
  },
};

export default nextConfig;
