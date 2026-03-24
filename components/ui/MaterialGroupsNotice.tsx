import React from "react"

type Props = {
  heading: string
  body: string
  dataCy?: string
}

const MaterialGroupsNotice: React.FC<Props> = ({ heading, body, dataCy }) => {
  return (
    <div
      data-cy={dataCy}
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="font-semibold">{heading}</p>
      <p className="mt-1">{body}</p>
    </div>
  )
}

export default MaterialGroupsNotice
