import React from "react"
import { getSubtleTagColor, getTagColor } from "lib/tagColors"
import { formatTagLabel } from "lib/tagLabels"

type Props = {
  tag: string
  variant?: "solid" | "subtle"
  className?: string
}

const TagChip: React.FC<Props> = ({ tag, variant = "solid", className }) => {
  const color = variant === "subtle" ? getSubtleTagColor(tag) : getTagColor(tag)

  return (
    <span
      className={
        variant === "subtle"
          ? `inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide leading-none ${className ?? ""}`.trim()
          : `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none ${className ?? ""}`.trim()
      }
      style={{ backgroundColor: color.background, borderColor: color.border ?? color.background, color: color.text }}
    >
      {formatTagLabel(tag)}
    </span>
  )
}

export default TagChip
