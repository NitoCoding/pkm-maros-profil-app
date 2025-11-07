import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: {
  //   : ['jsonwebtoken'], // Tambahkan ini
  // },
  serverExternalPackages: ['jsonwebtoken'],
  env: {
    // Tambahkan ini untuk mengekspos secret ke middleware
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
