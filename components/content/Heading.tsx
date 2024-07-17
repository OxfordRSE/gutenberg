import React from "react"

interface HeadingProps {
  content: React.ReactNode
  section: string
  tag?: string
}

const Heading: React.FC<HeadingProps> = ({ content, section, tag = "p" }) => {
  const Tag = tag as keyof JSX.IntrinsicElements
  const headingContent = content?.toString().replaceAll(" ", "-")

  return (
    <>
      <Tag id={headingContent}>{content}</Tag>
    </>
  )
}

export default Heading
