import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only standard options here, e.g.:
  reactStrictMode: true,
  eslint: {
    // ignore lint errors during production build until project cleanup
    ignoreDuringBuilds: true,
  },
  typescript: {
    // allow production builds despite TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
