import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'audio/mpeg',
          },
        ],
      },
      {
        source: '/sounds/:path*.m4a',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'audio/mp4',
          },
        ],
      },
    ];
  },
  // Ensure static files are served correctly
  trailingSlash: false,
  // Add experimental features for better audio handling
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
};

export default nextConfig;
