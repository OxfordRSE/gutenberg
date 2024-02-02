import React, { useRef, useState } from "react"

interface CalloutProps {
  content: React.ReactNode
  variant?: string
}

const Callout: React.FC<CalloutProps> = ({ content, variant }) => {
  return (
    <div
      className={`my-4 px-2 border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700 callout ${variant}`}
    >
      {content}
    </div>
  )
}

export default Callout
