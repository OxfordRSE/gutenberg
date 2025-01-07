import React, { useState } from "react"
import CopyToClipboard from "components/ui/CopyToClipboard"
import { FaLink } from "react-icons/fa"

interface HeadingProps {
  content: React.ReactNode
  section: string
  tag: string
}

const Heading: React.FC<HeadingProps> = ({ content, section, tag }) => {
  const Tag = tag as keyof React.JSX.IntrinsicElements
  const [isCopied, setIsCopied] = useState(false)

  const generateHeadingContent = () => {
    let headingContent = ""
    if (typeof content === "object") {
      for (let key in content) {
        if (typeof (content as any)[key] === "object") {
          headingContent += (content as any)[key].props.children
        } else {
          headingContent += (content as any)[key]
        }
      }
      return headingContent.replace(/#/g, "").trim().replace(/ /g, "-").replace(/:/g, "").replace(/`/g, "")
    }
  }

  const generateHeadingURL = () => {
    const href: string = typeof window !== "undefined" ? window.location.href.split("#")[0] : ""
    return href + "#" + generateHeadingContent()
  }

  const onCopyHandler = () => {
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1500)
  }

  return (
    <>
      <Tag id={generateHeadingContent()}>
        {content}
        <CopyToClipboard text={generateHeadingURL()}>
          <button className="text-xs align-center" onClick={onCopyHandler}>
            <FaLink className="group-hover:text-white ml-3" />
          </button>
        </CopyToClipboard>
        {isCopied && <span className="text-xs text-green-500 items-center ml-3">Copied to clipboard!</span>}
      </Tag>
    </>
  )
}

export default Heading
