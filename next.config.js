/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.creativecommons.org",
      },
    ],
    unoptimized: true,
    minimumCacheTTL: 1500000,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false }

    return config
  },
  basePath: process.env.NEXT_PUBLIC_BASEPATH,
}

module.exports = nextConfig
