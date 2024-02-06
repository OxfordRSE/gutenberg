import React from "react"
import { GetStaticProps } from "next"
import { makeSerializable } from "lib/utils"
import Image from "next/image"
import { HiArrowCircleLeft, HiArrowCircleRight } from "react-icons/hi"
import ExternalLink from "./ui/ExternalLink"
import { ThemeButton } from "./ui/ThemeSwitcher"
import { PageTemplate } from "lib/pageTemplate"
import { Markdown } from "components/content/Content"

interface Props {
  prevUrl?: string
  nextUrl?: string
  pageInfo?: PageTemplate
}

const Footer: React.FC<Props> = ({ pageInfo }) => {
  const footerAttrib = pageInfo?.footer
  return (
    <footer className="mt-4 mb-2 mx-2 p-2 bg-white rounded-lg shadow md:flex md:items-center md:justify-between dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <span className="flex flex-wrap text-sm text-gray-500 sm:text-center dark:text-gray-400">
        {footerAttrib && <Markdown markdown={"© " + new Date().getFullYear() + " " + footerAttrib} />}
      </span>
      <p className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        For attribution and license information click the @ symbol on the top right
      </p>
      <ThemeButton />
    </footer>
  )
}

export default Footer
