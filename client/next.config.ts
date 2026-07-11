import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:asset(hero-section\\.mp4|hero-poster\\.jpg|logo\\.png)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days — these assets only change on redeploy
  },
};

export default nextConfig;
