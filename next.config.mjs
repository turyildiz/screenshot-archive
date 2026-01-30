/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Disable webpack caching for Cloudflare Pages
    config.cache = false;
    return config;
  },
};

export default nextConfig;
