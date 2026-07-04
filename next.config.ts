import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only standard options here, e.g.:
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  typescript: {
    // allow production builds despite TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
