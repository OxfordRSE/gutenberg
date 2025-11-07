import { Children, FC, JSX, useEffect, useState } from "react"
import ReactMarkdown, { ExtraProps } from "react-markdown"
import { useHeadingObserver } from "lib/hooks/useHeadingObserver"
import useWindowSize from "lib/hooks/useWindowSize"
import { Toc } from "@mui/icons-material"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

type HeadingProps = JSX.IntrinsicElements["h2"] &
  ExtraProps & {
    activeId?: string | null
  }

const HeadingRenderer: FC<HeadingProps> = ({ activeId, children }) => {
  const [href, setHref] = useState("")

  if (typeof children === "object") {
    let headingContent = ""
    Children.forEach(children, (child) => {
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
          ? "transition-all border-l-2 border-purple-600 dark:bg-gray-800 bg-slate-400 pl-2 py-1 text-sm list-none bg-transparent"
          : "transition-all border-l-2 pl-2 py-1 text-sm list-none bg-transparent"
      }
    >
      <a
        className={
          activeId === headingContent
            ? "font-bold dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-600"
            : "font-normal dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-600"
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

const markdownComponents = {
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
  pre: () => null,
}
interface TableOfContentsProps {
  markdown: any
  tocTitle: string
}

const TableOfContents: FC<TableOfContentsProps> = ({ markdown, tocTitle }: TableOfContentsProps) => {
  const { activeId } = useHeadingObserver()
  // override h2 to add the active heading ID.
  markdownComponents.h2 = ({ children }: HeadingProps) => HeadingRenderer({ activeId, children })
  const windowSize = useWindowSize()
  const isSmallScreen = (windowSize?.width ?? 1024) < 1024
  const [collapsed, setCollapsed] = useState(isSmallScreen)

  let maxHeightClass = "max-h-72"

  let marginTopClass = "mt-6"
  if (tocTitle.length >= 22) {
    marginTopClass = "mt-12"
  }
  // auto-update collapse when screen size changes
  useEffect(() => {
    setCollapsed(isSmallScreen)
  }, [isSmallScreen])

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

  return (
    <div
      className={`absolute top-32 right-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-lg dark:shadow-lg rounded-md ${
        collapsed ? "w-10" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full relative">
        {/* Header with collapse toggle */}
        <div
          className="flex items-center mb-4 absolute top-0 z-50 p-1 bg-transparent"
          style={{ cursor: "pointer", pointerEvents: "auto" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {collapsed ? (
            <button
              className="p-1"
              onClick={(e) => {
                e.stopPropagation()
                setCollapsed(false)
              }}
            >
              {" "}
              <button
                className="ml-auto p-1"
                style={{ width: "2.25rem", height: "2.25rem" }}
                onClick={(e) => {
                  e.stopPropagation()
                  setCollapsed(false)
                }}
                aria-label="Expand Table of Contents"
              >
                <span className="flex items-center justify-center">
                  <Toc className="w-6 h-6 mr-" />
                  <KeyboardArrowLeftIcon className="w-4 h-4  hover:text-purple-600 dark:hover:text-purple-600" />
                </span>
              </button>
            </button>
          ) : (
            <>
              <Toc className="w-6 h-6 mr-2 mb-1" />
              <span className="text-sm font-bold mb-1 hover:text-purple-600 dark:hover:text-purple-600">
                {tocTitle}
              </span>
              <button
                className="ml-auto p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setCollapsed(true)
                }}
                aria-label="Collapse Table of Contents"
              >
                <KeyboardArrowRightIcon className="w-4 h-4 mb-1 hover:text-purple-600 dark:hover:text-purple-600" />
              </button>
            </>
          )}
        </div>

        {/* TOC content (only when not collapsed) */}
        {!collapsed && (
          <nav
            className={`${maxHeightClass} mt-8 overflow-y-auto font-bold pointer-events-auto bg-transparent ${marginTopClass}`}
          >
            <ul>
              <ReactMarkdown components={markdownComponents}>{markdown || ""}</ReactMarkdown>
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

export default TableOfContents
