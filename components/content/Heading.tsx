import React from "react"
import CopyToClipboard from "components/ui/CopyToClipboard"
import { FaLink } from "react-icons/fa"
import { reduceRepeatingPatterns } from "lib/utils"

interface HeadingProps {
  content: React.ReactNode
  section: string
  tag: string
  spanId?: string
}

const Heading: React.FC<HeadingProps> = ({ content, section, tag, spanId }) => {
  const Tag = tag as keyof React.JSX.IntrinsicElements

  const extractHeadingText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node)
    }

    if (Array.isArray(node)) {
      return node.map((child) => extractHeadingText(child)).join("")
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      return extractHeadingText(node.props.children)
    }

    return ""
  }

  const generateHeadingContent = () => {
    return reduceRepeatingPatterns(extractHeadingText(content))
      .replace(/#/g, "")
      .trim()
      .replace(/ /g, "-")
      .replace(/:/g, "")
      .replace(/`/g, "")
      .replace(/\$/g, "")
  }

  const generateHeadingURL = () => {
    const href: string = typeof window !== "undefined" ? window.location.href.split("#")[0] : ""
    return href + "#" + generateHeadingContent()
  }

  return (
    <>
      <Tag id={generateHeadingContent()} className="inline-flex items-center space-x-2">
        <span id={spanId}>{content}</span>
        <CopyToClipboard text={generateHeadingURL()}>
          {({ copy, copied }) => (
            <span className="relative inline-flex">
              <button type="button" className="text-xs flex items-center space-x-1" onClick={() => void copy()}>
                <FaLink className="group-hover:text-white" />
              </button>
              {copied && (
                <span
                  data-cy="copy-feedback"
                  role="status"
                  aria-live="polite"
                  className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
                >
                  Copied to clipboard!
                </span>
              )}
            </span>
          )}
        </CopyToClipboard>
      </Tag>
    </>
  )
}

export default Heading
