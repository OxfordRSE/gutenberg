import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useHeadingObserver } from "lib/hooks/useHeadingObserver"
import { Section } from "lib/material"

const TableOfContents = (markdown: any) => {
  console.log(markdown.markdown)

  const { activeId } = useHeadingObserver()

  const HeadingRenderer = ({ level, children }: { level: number; children: React.ReactNode }) => {
    const Tag = `h${level}`
    const [href, setHref] = useState("")

    useEffect(() => {
      const headingContent = String(children)?.replaceAll(" ", "-")
      if (typeof window !== "undefined") {
        setHref((window.location.href.split("#")[0] + "#" + headingContent).replaceAll(" ", "-"))
      }
    }, [children])

    let headingContent = String(children)?.replaceAll(" ", "-")
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
              : "font-normal dark:text-slate-200  dark:hover:text-slate-50"
          }
          href={href}
        >
          {children}
        </a>
      </li>
    )
  }

  return (
    <nav className="absolute top-32 right-0 w-48  p-2 ml-4 max-h-96 overflow-scroll font-bold pointer-events-auto bg-transparent">
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
        {markdown.markdown || ""}
      </ReactMarkdown>
    </nav>
  )
}

export default TableOfContents
