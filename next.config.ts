import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'desabentenggajah.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.desabentenggajah.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  serverExternalPackages: ['jsonwebtoken'],

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const allowedOrigin = isProd
      ? 'https://desabentenggajah.com'
      : 'http://localhost:4000';

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin,
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "style-src 'self' 'unsafe-inline';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
              "img-src 'self' data: blob: *.desabentenggajah.com res.cloudinary.com *.tile.openstreetmap.org *.openstreetmap.org;",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://youtu.be;",
              "connect-src 'self';"
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;