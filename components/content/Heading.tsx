import React, { useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { FaLink } from "react-icons/fa"

interface HeadingProps {
  content: React.ReactNode
  section: string
  tag?: string
}

const Heading: React.FC<HeadingProps> = ({ content, section, tag = "p" }) => {
  const Tag = tag as keyof JSX.IntrinsicElements
  const headingContent = content?.toString().replaceAll(" ", "-")
  const [isCopied, setIsCopied] = useState(false)

  const generateHeadingURL = () => {
    const href: string = typeof window !== "undefined" ? window.location.href.split("#")[0] : ""
    return href + "#" + headingContent ?? ""
  }

  const onCopyHandler = () => {
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1500)
  }

  return (
    <>
      <Tag id={headingContent} className="flex gap-3">
        {content}
        <CopyToClipboard text={generateHeadingURL()}>
          <button className="text-xs align-top" onClick={onCopyHandler}>
            <FaLink className="group-hover:text-white" />
          </button>
        </CopyToClipboard>
        {isCopied && <span className="text-xs text-green-500 flex items-center">Copied to clipboard!</span>}
      </Tag>
    </>
  )
}

export default Heading
