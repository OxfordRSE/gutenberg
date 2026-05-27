import React from "react"
import Link from "next/link"
import { getSubtleTagColor, getTagColor } from "lib/tagColors"
import { formatTagLabel } from "lib/tagLabels"

type Props = {
  tag: string
  variant?: "solid" | "subtle"
  className?: string
  linkToFilter?: boolean
}

const TagChip: React.FC<Props> = ({ tag, variant = "solid", className, linkToFilter = false }) => {
  const color = variant === "subtle" ? getSubtleTagColor(tag) : getTagColor(tag)
  const baseClass =
    variant === "subtle"
      ? `inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide leading-none ${className ?? ""}`.trim()
      : `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none ${className ?? ""}`.trim()
  const style = { backgroundColor: color.background, borderColor: color.border ?? color.background, color: color.text }

  if (linkToFilter) {
    return (
      <Link
        href={{ pathname: "/courses", query: { tag } }}
        className={`${baseClass} hover:opacity-80 transition-opacity cursor-pointer no-underline`}
        style={style}
      >
        {formatTagLabel(tag)}
      </Link>
    )
  }

  return (
    <span className={baseClass} style={style}>
      {formatTagLabel(tag)}
    </span>
  )
}

export default TagChip
