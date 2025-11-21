import { Button } from "flowbite-react"
import { ReactNode, Ref, useRef } from "react"
import { CommentThread, Comment } from "pages/api/commentThread"
import { BiCommentCheck, BiCommentDetail } from "react-icons/bi"

import useCommentThread from "lib/hooks/useCommentThread"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useEvent from "lib/hooks/useEvent"
import useProfile from "lib/hooks/useProfile"

import useUser from "lib/hooks/useUser"
import ThreadDialog from "./ThreadDialog"

interface TinyButtonProps {
  children: ReactNode
  onClick?: () => void
  dataCy?: string
  disabled?: boolean
  ref?: Ref<HTMLButtonElement>
}

export const TinyButton = ({ children, ...props }: TinyButtonProps) => {
  let buttonProps = { ...props }
  delete buttonProps.dataCy

  return (
    <div data-cy={props.dataCy}>
      <Button
        className="m-1 bg-gray-300 dark:bg-slate-800 text-black dark:text-white focus:ring"
        {...buttonProps}
        size="xxs"
        pill={true}
      >
        {children}
      </Button>
    </div>
  )
}

interface ThreadProps {
  thread: number | CommentThread
  active: boolean
  setActive: (active: boolean) => void
  onDelete: () => void
  finaliseThread: (thread: CommentThread, comment: Comment) => void
}

function useResolveThread(thread: number | CommentThread) {
  let commentThread: CommentThread
  let commentThreadIsLoading: boolean
  let isLoading: boolean
  let isPlaceholder: boolean
  let threadId: number
  let mutate: (commentThread: CommentThread) => void
  const result = useCommentThread(typeof thread === "number" ? thread : undefined)
  if (typeof thread === "number") {
    isPlaceholder = false
    threadId = thread
    commentThread = result.commentThread as CommentThread
    isLoading = result.isLoading
    commentThreadIsLoading = result.isLoading
    mutate = result.mutate
  } else {
    isPlaceholder = true
    commentThread = thread
    threadId = -1
    commentThreadIsLoading = false
    isLoading = false
    mutate = () => {}
  }
  return { commentThread, threadId, commentThreadIsLoading, isLoading, isPlaceholder, mutate }
}

const Thread = ({ thread, active, setActive, onDelete, finaliseThread }: ThreadProps) => {
  const { commentThread, threadId, commentThreadIsLoading, isPlaceholder, mutate } = useResolveThread(thread)
  const { isLoading: userIsLoading } = useUser(commentThread?.createdByEmail)
  const { userProfile, isLoading: profileLoading } = useProfile()
  const [activeEvent] = useActiveEvent()

  const { event: eventData } = useEvent(activeEvent?.id)

  const popupRef = useRef<HTMLDialogElement | null>(null) // Reference for the popup element (the comment thread)
  const buttonRef = useRef<HTMLButtonElement | null>(null) // Reference for the button that opens the thread

  const handleOpen = () => {
    setActive(true)
    setTimeout(() => {
      // Wait for one render cycle then focus the dialog.
      popupRef.current?.focus()
    }, 0)
  }

  const handleClose = () => {
    setActive(false)
    buttonRef.current?.focus()
  }

  if (!activeEvent) return null

  if (commentThreadIsLoading || userIsLoading || profileLoading) return null

  const myUserOnEvent = eventData?.UserOnEvent.find((e) => e.userEmail == userProfile?.email)
  const isInstructor = myUserOnEvent?.status === "INSTRUCTOR" || false
  const isAdmin = userProfile?.admin

  const canView = commentThread?.instructorOnly === false || isInstructor || isAdmin
  if (!canView) return null

  const canEdit = userProfile?.admin || userProfile?.email === commentThread?.createdByEmail
  const canResolve = userProfile?.admin || isInstructor || userProfile?.email === commentThread?.createdByEmail

  return (
    <div className="relative" id={`comment-thread-${threadId}`}>
      <div className="flex justify-end opacity-50 md:opacity-100 xl:justify-start">
        <TinyButton
          ref={buttonRef}
          onClick={handleOpen}
          dataCy={`Thread:${threadId}:OpenCloseButton`}
          aria-label="Read comments"
          aria-haspopup="dialog"
          aria-expanded={active.toString()}
        >
          {commentThread?.resolved ? (
            <BiCommentCheck className="text-green dark:text-green-600" />
          ) : (
            <BiCommentDetail className="dark:text-slate-500 text-slate-500" />
          )}
        </TinyButton>
      </div>
      <ThreadDialog
        active={active}
        setActive={setActive}
        canEdit={canEdit}
        canResolve={canResolve}
        commentThread={commentThread}
        finaliseThread={finaliseThread}
        handleClose={handleClose}
        isPlaceholder={isPlaceholder}
        mutate={mutate}
        onDelete={onDelete}
        ref={popupRef}
      />
    </div>
  )
}

export default Thread
