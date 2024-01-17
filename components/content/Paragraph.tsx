import { Button, Card } from "flowbite-react"
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTextSelection } from "use-text-selection"
import { BiCommentAdd } from "react-icons/bi"

//import { similarity } from 'sentence-similarity'
import similarity from "wink-nlp/utilities/similarity"

import winkNLP, { Bow } from "wink-nlp"
import model from "wink-eng-lite-web-model"
import { Markdown } from "./Content"
import style from "react-syntax-highlighter/dist/cjs/styles/prism/lucario"
import Thread from "./Thread"
import Popover from "./Popover"
import useCommentThreads from "lib/hooks/useCommentThreads"
import postComment from "lib/actions/postComment"
import postCommentThread from "lib/actions/postCommentThread"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Comment } from "pages/api/comment/[commentId]"
import { CommentThread } from "pages/api/commentThread"
import { post } from "cypress/types/jquery"
import { set } from "cypress/types/lodash"
import { useSession } from "next-auth/react"

const nlp = winkNLP(model)
const its = nlp.its
const as = nlp.as

interface ParagraphProps {
  content: React.ReactNode
  section: string
}

const Paragraph: React.FC<ParagraphProps> = ({ content, section }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const { commentThreads, error, isLoading, mutate } = useCommentThreads(activeEvent?.id)
  const [activeThreadId, setActiveThreadId] = useState<number | undefined>(undefined)
  const [tempThread, setTempThread] = useState<CommentThread | undefined>(undefined)
  const [tempActive, setTempActive] = useState<boolean>(false)
  const email = useSession().data?.user?.email

  const { similarThreads, contentText } = useMemo(() => {
    let contentText = ""
    if (typeof content === "string") {
      contentText = content
    } else if (Array.isArray(content)) {
      contentText = content.filter((c) => typeof c === "string").join("")
    }
    const contentTokens = nlp
      .readDoc(contentText)
      .tokens()
      .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
    const contentBow = contentTokens.out(its.value, as.bow) as Bow

    const similarThreads = commentThreads
      ?.filter((thread) => section === thread.section)
      .filter((thread) => {
        const threadTokens = nlp
          .readDoc(thread.textRef)
          .tokens()
          .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
        const threadBow = threadTokens.out(its.value, as.bow) as Bow
        return similarity.bow.cosine(contentBow, threadBow) > 0.9
      })
    return { similarThreads, contentText }
  }, [content, commentThreads, section])

  const handleCreateThread = (text: string) => {
    if (!activeEvent) return
    const textRefStart = contentText.indexOf(text)
    const textRefEnd = textRefStart + text.length
    const newThread: CommentThread = createEmptyThread(
      activeEvent.id,
      section,
      textRefStart,
      textRefEnd,
      text,
      email as string
    )
    setTempThread(newThread)
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
    const newThread = {
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
      setTempThread(undefined)
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
        {content}
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
                  key={tempThread.id}
                  thread={tempThread}
                  active={tempActive}
                  setActive={setTempActive}
                  finaliseThread={finaliseThread}
                  onDelete={() => handleDeleteThread(tempThread)}
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
