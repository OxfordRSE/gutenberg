import React, { useEffect, useState } from "react"
import ReactMarkdown, { ExtraProps } from "react-markdown"
import { useHeadingObserver } from "lib/hooks/useHeadingObserver"
import useWindowSize from "lib/hooks/useWindowSize"
import { Toc } from "@mui/icons-material"

interface TableOfContentsProps {
  markdown: any
  tocTitle: string
}

type HeadingProps = React.JSX.IntrinsicElements["h2"] & ExtraProps

const TableOfContents: React.FC<TableOfContentsProps> = ({ markdown, tocTitle }: TableOfContentsProps) => {
  const { activeId } = useHeadingObserver()

  const windowSize = useWindowSize()
  let maxHeightClass = "max-h-72"

  let marginTopClass = "mt-6"
  if (tocTitle.length >= 22) {
    marginTopClass = "mt-12"
  }

  // Adjusting max height based on window size
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

  const HeadingRenderer = ({ children }: HeadingProps) => {
    const [href, setHref] = useState("")

    if (typeof children === "object") {
      let headingContent = ""
      React.Children.forEach(children, (child) => {
        if (typeof child === "string") {
          headingContent += child
        }
        if (
          child &&
          typeof child === "object" &&
          "props" in child &&
          child.props &&
          typeof child.props === "object" &&
          "children" in child.props
        ) {
          headingContent += child.props.children
        }
      })
      children = headingContent
    }
    children = String(children).replace(/#/g, "").replace(/`/g, "")

    useEffect(() => {
      const headingContent = String(children)?.replaceAll(" ", "-").replace(/`/g, "")
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
            e.preventDefault()
            const targetElement = document.getElementById(headingContent)
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }}
        >
          {children}
        </a>
      </li>
    )
  }

  return (
    <div className="absolute top-32 right-0 w-48 p-2 ml-4">
      {/* Container div that holds both the tocTitle and scrollable nav */}
      <div className="flex flex-col h-full">
        <div
          className="flex items-center mb-4 absolute top-0 z-9999 p-2 bg-transparent"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        >
          <span className="text-sm font-bold -ml-4">
            <Toc className="mr-2 mb-1" />
            {tocTitle}
          </span>
        </div>

        <nav
          className={`${maxHeightClass} overflow-y-auto font-bold pointer-events-auto bg-transparent ${marginTopClass}`}
        >
          <ReactMarkdown
            components={{
              h1: () => null,
              h2: HeadingRenderer,
              h3: () => null,
              h4: () => null,
              h5: () => null,
              h6: () => null,
              hr: () => null,
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
      </div>
    </div>
  )
}

export default TableOfContents
