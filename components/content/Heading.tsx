import React from "react"

interface HeadingProps {
  content: React.ReactNode
  section: string
  tag?: string
}

const Heading: React.FC<HeadingProps> = ({ content, section, tag = "p" }) => {
  const Tag = tag as keyof JSX.IntrinsicElements
  const headingContent = content?.toString().replaceAll(" ", "-")

  const generateHeadingURL = () => {
    const href: string = typeof window !== "undefined" ? window.location.href.split("#")[0] : ""
    return href + "#" + headingContent ?? ""
  }

  return (
    <>
      <Tag id={headingContent}>{content}</Tag>
    </>
  )
}

export default Heading
