/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer"
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
import { withPlausibleProxy } from "next-plausible"
import plausibleHost from "./lib/plausibleHost.js"

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  trailingSlash: false,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "train.oxrse.uk",
          },
        ],
        destination: "https://train.rse.ox.ac.uk/:path*",
        permanent: true,
      },
    ]
  },
}

export default withPlausibleProxy({
  customDomain: plausibleHost,
})(nextConfig)
