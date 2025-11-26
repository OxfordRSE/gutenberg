import Link from "next/link"
import Image from "next/image"
import type { PageTemplate } from "lib/pageTemplate"

export function HomeBreadcrumb({ pageInfo }: { pageInfo?: PageTemplate }) {
  const hasLogo = pageInfo?.logo?.src
  if (hasLogo) {
    // Logo + title version
    return (
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        aria-label="Home"
      >
        <Image src={pageInfo.logo.src} alt="Home" className="w-8 h-8 mr-2" />
      </Link>
    )
  }

  // Fallback to old breadcrumb (icon + "Home")
  return (
    <Link
      href="/"
      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
      </svg>
      Home
    </Link>
  )
}
