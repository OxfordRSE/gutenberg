import React, { useRef, useState } from 'react'

interface ChallengeProps {
  content: React.ReactNode,
}

const Callout: React.FC<ChallengeProps> = ({ content }) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700">
      <div className="mx-2 pb-2">
        {content}
      </div>
    </div>
  )
}

export default Callout
