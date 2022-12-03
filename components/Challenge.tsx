import React, { useRef, useState } from 'react'

interface ChallengeProps {
  content: React.ReactNode,
  title: string,
  id: string,
}

const Challenge: React.FC<ChallengeProps> = ({ content, title, id }) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700">
      <div className="rounded-t-lg bg-slate-700 dark:bg-slate-300">
        <h3 className="mx-2 my-0 text-slate-100 dark:text-black">{title}</h3>
      </div>
      <div className="mx-2 pb-2">
        {content}
      </div>
    </div>
  )
}

export default Challenge
