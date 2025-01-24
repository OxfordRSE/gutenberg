import React, { useState } from "react"
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

  const generateHeadingContent = () => {
    if (typeof content === "string") {
      // NOTE(ADW): I think the behaviour here has been changed in react 19 and we get a string instead of an object
      // I have kept the old code in case this is not universally true.
      return content.replace(/#/g, "").trim().replace(/ /g, "-").replace(/:/g, "").replace(/`/g, "").replace(/$/g, "")
    }
    let headingContent = ""
    if (React.isValidElement(content)) {
      React.Children.forEach(content, (child) => {
        if (React.isValidElement(child)) {
          if (child.props && typeof child.props === "object" && "children" in child.props) {
            headingContent += child.props.children
          }
        } else if (typeof child === "string") {
          headingContent += child
        }
      })
      return headingContent
        .replace(/#/g, "")
        .trim()
        .replace(/ /g, "-")
        .replace(/:/g, "")
        .replace(/`/g, "")
        .replace(/\$/g, "")
    }
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
          <button className="text-xs flex items-center space-x-1">
            <FaLink className="group-hover:text-white" />
          </button>
        </CopyToClipboard>
      </Tag>
    </>
  )
}

export default Heading
