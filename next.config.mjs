/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
  async rewrites() {
    return [
      // RFC 9116 security.txt lives at /.well-known/security.txt but the
      // file-based router can't host a dotted dir, so proxy to an API route.
      { source: '/.well-known/security.txt', destination: '/api/well-known/security.txt' },
    ];
  },
};

export default nextConfig;
