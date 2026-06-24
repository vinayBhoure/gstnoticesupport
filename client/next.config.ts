import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    // Allow Turbopack to resolve files in ../server/src (for @server/* alias)
    root: path.join(__dirname, '..'),
  },
};

export default nextConfig;
