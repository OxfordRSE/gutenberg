import React, { useMemo, useRef, useState } from "react"

import Thread from "./Thread"
import Popover from "./Popover"
import useCommentThreads from "lib/hooks/useCommentThreads"
import postCommentThread from "lib/actions/postCommentThread"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Comment } from "pages/api/comment/[commentId]"
import { CommentThread, CommentThreadPost } from "pages/api/commentThread"
import { useSession } from "next-auth/react"
import { computeSimilarity, tokenizeText } from "lib/nlp"
import { Bow } from "wink-nlp"

interface ParagraphProps {
  content: React.ReactNode
  section: string
}

function getSimilarThreads(
  contentBow: Bow,
  commentThreads: CommentThread[] | undefined = [],
  section: string
): CommentThread[] | undefined {
  return commentThreads
    .filter((thread) => section === thread.section)
    .filter((thread) => {
      const threadBow = tokenizeText(thread.textRef)
      return computeSimilarity(contentBow, threadBow) > 0.9
    })
}

function useSimilarThreads(
  contentText: string,
  commentThreads: CommentThread[] | undefined = [],
  section: string
): CommentThread[] | undefined {
  // contentText doesn't change between builds so memoise it separately.
  const contentBow = useMemo(() => tokenizeText(contentText), [contentText])
  const similarThreads = useMemo(
    () => getSimilarThreads(contentBow, commentThreads, section),
    [contentBow, commentThreads, section]
  )
  return similarThreads
}

const Paragraph: React.FC<ParagraphProps> = ({ content, section }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const { commentThreads, mutate } = useCommentThreads(activeEvent?.id)
  const [activeThreadId, setActiveThreadId] = useState<number | undefined>(undefined)
  const [tempThread, setTempThread] = useState<{
    thread: CommentThread
    initialAnchor?: { top: number; left: number }
  } | null>(null)
  const [tempActive, setTempActive] = useState<boolean>(false)
  const email = useSession().data?.user?.email

  let contentText = ""
  if (typeof content === "string") {
    contentText = content
  } else if (Array.isArray(content)) {
    contentText = content.filter((c) => typeof c === "string").join("")
  }

  const similarThreads = useSimilarThreads(contentText, commentThreads, section)

  const handleCreateThread = (text: string) => {
    if (!activeEvent) return

    const textRefStart = contentText.indexOf(text)
    const textRefEnd = textRefStart + text.length
    const buttonRect = ref?.current?.getBoundingClientRect()
    const newThread: CommentThread = createEmptyThread(
      activeEvent.id,
      section,
      textRefStart,
      textRefEnd,
      text,
      email as string
    )
    setTempThread({
      thread: newThread,
      initialAnchor: buttonRect ? { top: buttonRect.top + window.scrollY, left: buttonRect.left + 355 } : undefined,
    })
    setTempActive(true)
  }

  const createEmptyThread = (
    eventId: number,
    section: string,
    textRefStart: number,
    textRefEnd: number,
    text: string,
    email: string
  ): CommentThread => {
    const comment: Comment = {
      id: -1,
      threadId: -1,
      markdown: "",
      index: -1,
      created: new Date(),
      createdByEmail: email,
    }
    const thread: CommentThread = {
      id: -1,
      eventId: eventId,
      section: section,
      textRef: contentText,
      textRefStart: textRefStart,
      textRefEnd: textRefEnd,
      Comment: [comment],
      createdByEmail: email,
      groupId: null,
      problemTag: "",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
    }
    return thread
  }

  const finaliseThread = (thread: CommentThread, comment: Comment) => {
    if (!activeEvent) return
    const newThread: CommentThreadPost = {
      textRef: thread.textRef,
      textRefStart: thread.textRefStart,
      textRefEnd: thread.textRefEnd,
      eventId: activeEvent.id,
      section: thread.section,
      initialCommentText: comment.markdown,
    }
    postCommentThread(newThread).then((thread) => {
      const newThreads = commentThreads ? [...commentThreads, thread] : [thread]
      mutate(newThreads)
      setTempThread(null)
      setActiveThreadId(thread.id)
    })
  }

  const handleDeleteThread = (thread: CommentThread) => {
    if (!commentThreads) return
    mutate(commentThreads.filter((t) => t.id !== thread.id))
    if (activeThreadId === thread.id) {
      setActiveThreadId(undefined)
    }
  }

  return (
    <>
      <div data-cy="paragraph" ref={ref} className="relative pb-2">
        <div className="m-0 pb-0">{content}</div>
        {activeEvent && (
          <div className={`absolute top-0 right-0 md:-right-6 xl:-right-[420px]`}>
            <div className={`w-[420px]`}>
              {similarThreads?.map((thread) => (
                <Thread
                  key={thread.id}
                  thread={thread.id}
                  active={activeThreadId === thread.id}
                  setActive={(active: boolean) =>
                    active ? setActiveThreadId(thread.id) : setActiveThreadId(undefined)
                  }
                  finaliseThread={finaliseThread}
                  onDelete={() => handleDeleteThread(thread)}
                />
              ))}
              {tempThread && (
                <Thread
                  key={tempThread.thread.id}
                  thread={tempThread.thread}
                  active={tempActive}
                  setActive={setTempActive}
                  finaliseThread={finaliseThread}
                  onDelete={() => handleDeleteThread(tempThread.thread)}
                  initialAnchor={tempThread.initialAnchor}
                />
              )}
            </div>
          </div>
        )}
      </div>
      {activeEvent && <Popover target={ref?.current || undefined} onCreate={handleCreateThread} />}
    </>
  )
}

export default Paragraph
