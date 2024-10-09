import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useHeadingObserver } from "lib/hooks/useHeadingObserver"
import useWindowSize from "lib/hooks/useWindowSize"
import { Toc } from "@mui/icons-material"
import { Section } from "lib/material"

interface TableOfContentsProps {
  markdown: any
  tocTitle: string
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ markdown, tocTitle }: TableOfContentsProps) => {
  console.log("tt", tocTitle)
  const { activeId } = useHeadingObserver()
  const windowSize = useWindowSize()
  console.log(markdown)
  let maxHeightClass = "max-h-72"
  // might be a better way but trying here to stop it clipping into next section links
  if (windowSize.height) {
    if (windowSize.height < 380) {
      maxHeightClass = "max-h-24"
    } else if (windowSize.height < 480) {
      maxHeightClass = "max-h-36"
    } else if (windowSize.height < 550) {
      maxHeightClass = "max-h-48"
    } else if (windowSize.height < 640) {
      maxHeightClass = "max-h-60"
    } else if (windowSize.height < 720) {
      maxHeightClass = "max-h-80"
    } else {
      maxHeightClass = "max-h-96"
    }
  }
  const HeadingRenderer = ({ level, children }: { level: number; children: React.ReactNode }) => {
    const Tag = `h${level}`
    const [href, setHref] = useState("")

    useEffect(() => {
      const headingContent = String(children)?.replaceAll(" ", "-")
      if (typeof window !== "undefined") {
        setHref((window.location.href.split("#")[0] + "#" + headingContent).replaceAll(" ", "-"))
      }
    }, [children])
    let headingContent = String(children)?.replaceAll(" ", "-").replaceAll(":", "")
    return (
      <li
        key={headingContent}
        className={
          activeId === headingContent
            ? "transition-all border-l-2 border-purple-600 dark:bg-gray-800 bg-slate-300 pl-2 py-1 text-sm list-none bg-transparent rounded-r-lg"
            : "transition-all border-l-2 pl-2 py-1 text-sm list-none bg-transparent"
        }
      >
        <a
          className={
            activeId === headingContent
              ? "font-bold dark:text-slate-200 hover:text-slate-50"
              : "font-normal dark:text-slate-200 dark:hover:text-slate-50"
          }
          href={href}
          onClick={(e) => {
            e.preventDefault() // Prevent the default anchor behavior
            const targetElement = document.getElementById(headingContent) // Get the target element by ID
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth", block: "start" }) // Smooth scroll to target element
            }
          }}
        >
          {children}
        </a>
      </li>
    )
  }

  return (
    <nav
      className={`${maxHeightClass} absolute top-32 right-0 w-56  p-2 ml-4
                 overflow-y-auto font-bold pointer-events-auto bg-transparent`}
    >
      <div
        className="flex items-center mb-4"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ cursor: "pointer" }} // Optional: adds pointer cursor for better UX
      >
        <Toc className="mr-2" />
        <span className="text-sm font-bold">{tocTitle}</span>
      </div>
      <ReactMarkdown
        components={{
          h1: () => null,
          h2: HeadingRenderer,
          h3: () => null,
          h4: () => null,
          h5: () => null,
          h6: () => null,
          p: () => null,
          ul: () => null,
          ol: () => null,
          table: () => null,
          blockquote: () => null,
          code: () => null,
        }}
      >
        {markdown || ""}
      </ReactMarkdown>
    </nav>
  )
}

export default TableOfContents
