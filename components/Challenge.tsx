import React, { useRef, useState } from 'react'

interface ChallengeProps {
  content: React.ReactNode,
  title: string,
  id: string,
}

const Challenge: React.FC<ChallengeProps> = ({ content, title, id }) => {
  return (
    <div className="rounded-t bg-slate-700/10 dark:bg-slate-100/10  ">
      <div className="rounded-t bg-slate-700 dark:bg-slate-100">
        <h3 className="mx-2 text-slate-100 dark:text-slate-700">{title}</h3>
      </div>
      <div className="mx-2">
        {content}
      </div>
    </div>
  )
}

export default Challenge
