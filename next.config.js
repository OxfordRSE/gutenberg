/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const { withPlausibleProxy } = require("next-plausible")
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

module.exports = withPlausibleProxy()(withBundleAnalyzer(nextConfig))
