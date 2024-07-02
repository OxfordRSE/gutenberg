import React from "react"
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
    <footer className="mt-4 mb-2 mx-2 p-2 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:gap-2 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <span className="flex flex-wrap text-sm text-gray-500 sm:text-center dark:text-gray-400">
        {footerAttrib && <Markdown markdown={"© " + new Date().getFullYear() + " " + footerAttrib} />}
      </span>
      
      <div className="flex justify-evenly gap-5 items-center mt-3">
        <p className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          For attribution and license information click the @ symbol on the top right
        </p>
        <ThemeButton />
      </div>
    </footer>
  )
}

export default Footer
