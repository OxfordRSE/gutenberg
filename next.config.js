/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer"
import { fileURLToPath } from "url"
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
import { withPlausibleProxy } from "next-plausible"
import plausibleHost from "./lib/plausibleHost.js"

const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  reactStrictMode: true,
  // Don't advertise the framework/version in the X-Powered-By header.
  poweredByHeader: false,
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

    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/coverage/**", "**/docs/_site/**"],
    }

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
  async headers() {
    const securityHeaders = [
      // Force HTTPS.
      { key: "Strict-Transport-Security", value: "max-age=86400" },
      // Block cross-origin framing (clickjacking).
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ]
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default withPlausibleProxy({
  customDomain: plausibleHost,
})(nextConfig)
