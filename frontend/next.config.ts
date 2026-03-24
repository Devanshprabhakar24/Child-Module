import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
