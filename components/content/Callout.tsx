import React from "react"
import type { IconType } from "react-icons"
import { GoAlert, GoBookmark, GoCommentDiscussion, GoFlame, GoLightBulb, GoReport } from "react-icons/go"

interface CalloutProps {
  content: React.ReactNode
  variant?: string
}

type VariantStyle = {
  label: string
  Icon: IconType
  border: string
  text: string
}

// Text colours are -700 in light and -400 in dark to meet WCAG AA contrast on the callout background
const variants: Record<string, VariantStyle> = {
  warning: {
    label: "Warning",
    Icon: GoAlert,
    border: "border-l-orange-500",
    text: "text-orange-700 dark:text-orange-400",
  },
  danger: { label: "Danger", Icon: GoFlame, border: "border-l-red-600", text: "text-red-700 dark:text-red-400" },
  note: { label: "Note", Icon: GoReport, border: "border-l-blue-600", text: "text-blue-700 dark:text-blue-400" },
  tip: { label: "Tip", Icon: GoLightBulb, border: "border-l-green-600", text: "text-green-700 dark:text-green-400" },
  keypoints: {
    label: "Key points",
    Icon: GoBookmark,
    border: "border-l-purple-600",
    text: "text-purple-700 dark:text-purple-400",
  },
  discussion: {
    label: "Discussion",
    Icon: GoCommentDiscussion,
    border: "border-l-cyan-500",
    text: "text-cyan-700 dark:text-cyan-400",
  },
}

const Callout: React.FC<CalloutProps> = ({ content, variant }) => {
  const style = variant ? variants[variant] : undefined
  const base = "my-4 px-2 bg-slate-50 dark:bg-slate-800 callout"

  if (!style) {
    return (
      <div className={`${base} border border-gray-200 dark:border-gray-700 rounded-lg ${variant ?? ""}`}>{content}</div>
    )
  }

  const { label, Icon, border, text } = style
  return (
    <div className={`${base} border-l-[6px] pt-2 ${border} ${variant}`}>
      <p className={`callout-label m-0 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide ${text}`}>
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
        {label}
      </p>
      {content}
    </div>
  )
}

export default Callout
