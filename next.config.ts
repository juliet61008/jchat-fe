import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-0c891655bcc94115b5a8e13adb182825.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
