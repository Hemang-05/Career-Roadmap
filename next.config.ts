import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Ensure cheerio and yt-search are handled correctly at build time
  transpilePackages: ['cheerio', 'yt-search'],
  webpack(config, { isServer }) {
    if (isServer) {
      // Prevent bundling cheerio and yt-search in the server build
      config.externals = [
        ...(config.externals || []),
        'cheerio',
        'yt-search'
      ];
    }
    return config;
  },
};

export default nextConfig;
