import React, { useEffect, useMemo, useRef, useState, startTransition } from "react"

import { stringSimilarity } from "string-similarity-js"
import Thread from "./Thread"
import Popover from "./Popover"
import useCommentThreads from "lib/hooks/useCommentThreads"
import postCommentThread from "lib/actions/postCommentThread"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Comment } from "pages/api/comment/[commentId]"
import { CommentThread, CommentThreadPost } from "pages/api/commentThread"
import { useSession } from "next-auth/react"

interface ParagraphProps {
  content: React.ReactNode
  section: string
}

function getSimilarThreads(
  contentText: string,
  commentThreads: CommentThread[] | undefined = [],
  section: string
): CommentThread[] | undefined {
  return commentThreads
    .filter((thread) => section === thread.section)
    .filter((thread) => {
      return stringSimilarity(contentText, thread.textRef) > 0.9
    })
}

const Paragraph: React.FC<ParagraphProps> = ({ content, section }) => {
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const { commentThreads, error, isLoading, mutate } = useCommentThreads(activeEvent?.id)
  const [activeThreadId, setActiveThreadId] = useState<number | undefined>(undefined)
  const [tempThread, setTempThread] = useState<{
    thread: CommentThread
  } | null>(null)
  const [tempActive, setTempActive] = useState<boolean>(false)
  const [textForMatching, setTextForMatching] = useState<string>("")
  const email = useSession().data?.user?.email

  useEffect(() => {
    setTextForMatching(getRenderedText())
  }, [content])

  // This stupid function is just to make it clearer that we are reusing the same logic for both comment thread creation and matching
  const getRenderedText = () => contentRef.current?.innerText || ""

  const { similarThreads, contentText } = useMemo(() => {
    const normalizedText = textForMatching.trim()
    const similarThreads = getSimilarThreads(normalizedText, commentThreads, section)
    return { similarThreads, contentText: textForMatching }
  }, [textForMatching, commentThreads, section])

  const handleCreateThread = (text: string) => {
    if (!activeEvent) return

    // Use innerText from ref to handle text selections spanning DOM nodes (e.g., <li> elements)
    const domText = getRenderedText()
    const textRefStart = domText.indexOf(text)
    const textRefEnd = textRefStart + text.length

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
    // Use innerText when contentText is empty (e.g., for list items with links)
    const fullText = getRenderedText()
    const thread: CommentThread = {
      id: -1,
      eventId: eventId,
      section: section,
      textRef: fullText,
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
      setActiveThreadId(undefined) // close the active thread popup
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
    <div data-cy="paragraph" ref={ref} className="relative pb-2">
      <div ref={contentRef} className="m-0 pb-0">
        {content}
      </div>
      {activeEvent && (
        <div className={`absolute top-0 right-0 md:-right-6 xl:-right-[420px]`}>
          <div className={`w-[420px]`}>
            {similarThreads?.map((thread) => (
              <Thread
                key={thread.id}
                thread={thread.id}
                active={activeThreadId === thread.id}
                setActive={(active: boolean) => (active ? setActiveThreadId(thread.id) : setActiveThreadId(undefined))}
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
              />
            )}
          </div>
        </div>
      )}
      {activeEvent && <Popover target={ref?.current || undefined} onCreate={handleCreateThread} />}
    </div>
  )
}

export default Paragraph
