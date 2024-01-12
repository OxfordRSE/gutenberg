import React, { useRef, useState } from "react"

interface ChallengeProps {
  content: React.ReactNode
}

const Callout: React.FC<ChallengeProps> = ({ content }) => {
  return (
    <div className="my-4 px-2 border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700">
      {content}
    </div>
  )
}

export default Callout
