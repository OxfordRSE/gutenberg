import React from "react"
import { Material, sectionSplit } from "lib/material"
import { EventFull } from "lib/types"
import Link from "next/link"
import useCommentThreads from "lib/hooks/useCommentThreads"

type Props = {
  event: EventFull
  material: Material
}

const EventCommentThreads: React.FC<Props> = ({ material, event }) => {
  const { commentThreads, error: threadsError, isLoading: threadsIsLoading } = useCommentThreads(event.id)
  if (threadsIsLoading) return <div>loading...</div>
  if (!commentThreads) return <div>failed to load</div>

  const unresolvedThreads = commentThreads.filter((thread) => !thread.resolved)
  return (
    <div>
      <ul className="list-disc text-gray-800 dark:text-gray-300">
        {unresolvedThreads.map((thread) => {
          const { theme, course, section, url } = sectionSplit(thread.section, material)
          const urlWithAnchor = url + `#comment-thread-${thread.id}`
          return (
            <li key={thread.id}>
              <Link href={urlWithAnchor}>
                <span className="font-bold">{thread.section}:</span> {thread.createdByEmail}:{" "}
                {thread.Comment.length > 0 ? thread.Comment[0].markdown : ""}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default EventCommentThreads
