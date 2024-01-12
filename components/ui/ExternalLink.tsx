import React from "react"

type ExternalLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean | undefined
}

const ExternalLink = ({ href, children, className, external }: ExternalLinkProps) => {
  if (!external) {
    external = true
  }
  const externalProps = external ? { target: "_blank", rel: "noreferrer" } : {}
  const linkClassName = `text-blue-500 hover:text-blue-700 ${className || ""}`
  return (
    <a href={href} className={linkClassName} {...externalProps}>
      {children}
    </a>
  )
}

export default ExternalLink
