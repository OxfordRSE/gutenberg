import { Button, Dropdown, Tooltip } from "flowbite-react"
import Avatar from "@mui/material/Avatar"
import { ReactNode, Ref, useCallback, useMemo, useRef, useState } from "react"
import { CommentThread, Comment } from "pages/api/commentThread"
import { BiCommentCheck, BiCommentDetail, BiDotsVerticalRounded, BiReply } from "react-icons/bi"
import { MdDelete } from "react-icons/md"
import { IoClose } from "react-icons/io5"

import postComment from "lib/actions/postComment"
import useCommentThread from "lib/hooks/useCommentThread"
import deleteCommentThread from "lib/actions/deleteThread"
import putCommentThread from "lib/actions/putCommentThread"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useEvent from "lib/hooks/useEvent"
import useProfile from "lib/hooks/useProfile"
import Stack from "components/ui/Stack"

import { GoIssueClosed } from "react-icons/go"
import { ImEye, ImEyeBlocked } from "react-icons/im"
import useUser from "lib/hooks/useUser"
import CommentView from "./Comment"
import { Provider } from "jotai"

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
  const { commentThread, threadId, commentThreadIsLoading, isLoading, isPlaceholder, mutate } = useResolveThread(thread)
  const { user, isLoading: userIsLoading, error: userError } = useUser(commentThread?.createdByEmail)
  const { userProfile, isLoading: profileLoading, error: profileError } = useProfile()
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const [threadEditing, setThreadEditing] = useState(false)
  const {
    event: eventData,
    error: eventError,
    isLoading: eventIsLoading,
    mutate: mutateEvent,
  } = useEvent(activeEvent?.id)

  const popupRef = useRef<HTMLDialogElement | null>(null) // Reference for the popup element (the comment thread)
  const triggerRef = useRef<HTMLDivElement | null>(null) // Reference for the trigger (Thread component) in paragraph
  const buttonRef = useRef<HTMLButtonElement | null>(null) // Reference for the button that opens the thread

  const popupPosition = { top: 0, left: 0 }

  // calculate popup position based on viewport width
  const popupWidth = 355
  const viewportWidth = window.innerWidth

  let leftPosition = 40
  if (leftPosition + popupWidth > viewportWidth) {
    // If the popup overflows the viewport, adjust to the left
    leftPosition = 0 - popupWidth - 15
  }

  popupPosition.left = leftPosition

  const handleOpen = useCallback(() => {
    setActive(true)
    setTimeout(() => {
      // Wait for one render cycle then focus the dialog.
      popupRef.current?.focus()
    }, 0)
  }, [])

  const sortedComments = useMemo(() => {
    if (!commentThread) return []
    return commentThread.Comment.sort((a, b) => a.index - b.index)
  }, [commentThread])

  if (!activeEvent) return null

  if (commentThreadIsLoading || userIsLoading || profileLoading) return null

  const myUserOnEvent = eventData?.UserOnEvent.find((e) => e.userEmail == userProfile?.email)
  const isInstructor = myUserOnEvent?.status === "INSTRUCTOR" || false
  const isAdmin = userProfile?.admin

  const canView = commentThread?.instructorOnly === false || isInstructor || isAdmin
  if (!canView) return null

  const canEdit = userProfile?.admin || userProfile?.email === commentThread?.createdByEmail
  const canResolve = userProfile?.admin || isInstructor || userProfile?.email === commentThread?.createdByEmail

  const savePlaceholder = (placeholder: Comment) => {
    finaliseThread(commentThread, placeholder)
  }

  const mutateComment = (comment: Comment) => {
    if (!commentThread) return
    const updatedComments: Comment[] = commentThread.Comment.map((c) => {
      if (c?.id === comment.id) {
        return comment
      } else {
        return c as Comment
      }
    })
    mutate({ ...commentThread, Comment: updatedComments })
  }

  const deleteComment = (comment: Comment) => {
    if (!commentThread) return
    mutate({ ...commentThread, Comment: commentThread.Comment.filter((c) => c.id !== comment.id) })
  }

  const handleClose = () => {
    setActive(false)
    buttonRef.current?.focus()
  }

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  const handleReply = () => {
    if (!commentThread || isPlaceholder) return
    postComment(threadId).then((comment: Comment) => {
      mutate({ ...commentThread, Comment: [...commentThread.Comment, comment] })
    })
  }

  const handleDelete = () => {
    if (!commentThread || isPlaceholder) return
    deleteCommentThread(commentThread.id).then((commentThread: CommentThread) => {
      onDelete()
    })
  }

  const handleInstructorOnly = () => {
    if (!commentThread) return
    putCommentThread({ ...commentThread, instructorOnly: !commentThread.instructorOnly }).then(
      (commentThread: CommentThread) => {
        mutate(commentThread)
      }
    )
  }

  const handleResolved = () => {
    if (!commentThread) return
    putCommentThread({ ...commentThread, resolved: !commentThread.resolved }).then((commentThread: CommentThread) => {
      mutate(commentThread)
    })
  }

  const renderPopup = () => {
    return (
      <dialog
        aria-label="Comments"
        open={active}
        ref={popupRef}
        className="absolute w-[355px] border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-gray-700 z-50"
        style={{
          margin: 0,
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
        }}
        data-cy={`Thread:${threadId}:Main`}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="absolute -top-1 left-0 not-prose">
          <Tooltip
            content={
              <>
                <span className="block text-sm">{user?.name}</span>
                <span className="block truncate text-sm font-medium">{commentThread?.createdByEmail}</span>
                <span className="block text-sm">
                  {commentThread?.created
                    ? new Date(commentThread?.created).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                    : ""}
                </span>
              </>
            }
          >
            <Stack direction="row" spacing={2} className="justify-center">
              <Avatar sx={{ width: 32, height: 32 }} src={user?.image || undefined} alt={user?.name || "Sign in"} />
              {commentThread?.resolved === true && (
                <GoIssueClosed
                  className="h-6 w-6 font-bold text-green dark:text-green-600"
                  data-cy={`Thread:${threadId}:IsResolved`}
                />
              )}
            </Stack>
          </Tooltip>
        </div>
        <div className={`flex items-center justify-between rounded-t-lg`}>
          <h3 className="w-full mx-2 my-0 text-base text-slate-100 dark:text-slate-900">{}</h3>
          <Stack direction="row-reverse">
            <TinyButton onClick={handleClose} dataCy={`Thread:${threadId}:CloseButton`} aria-label="Close comments">
              <IoClose />
            </TinyButton>
            {!isPlaceholder && (
              <Dropdown
                renderTrigger={() => (
                  <TinyButton>
                    <BiDotsVerticalRounded className="h-4 w-4" data-cy={`Thread:${threadId}:Dropdown`} />
                  </TinyButton>
                )}
                label={undefined}
                className="not-prose"
                aria-label="Thread options"
              >
                <Dropdown.Item
                  className="hover:bg-gray-400"
                  icon={commentThread?.instructorOnly === true ? ImEyeBlocked : ImEye}
                  onClick={handleInstructorOnly}
                  data-cy={`Thread:${threadId}:Visibility`}
                >
                  Visibility
                </Dropdown.Item>
                <Dropdown.Item
                  className="hover:bg-gray-400"
                  icon={MdDelete}
                  onClick={handleDelete}
                  data-cy={`Thread:${threadId}:Delete`}
                >
                  Delete
                </Dropdown.Item>
              </Dropdown>
            )}
          </Stack>
        </div>
        {isPlaceholder &&
          sortedComments.map((comment) => (
            <Provider key={comment.id}>
              <CommentView
                key={comment.id}
                comment={comment}
                mutateComment={savePlaceholder}
                saveComment={savePlaceholder}
                deleteComment={deleteComment}
                isPlaceholder={true}
                threadEditing={threadEditing}
                setThreadEditing={setThreadEditing}
              />
            </Provider>
          ))}
        {!isPlaceholder &&
          sortedComments.map((comment) => (
            <Provider key={comment.id}>
              <CommentView
                key={comment.id}
                comment={comment}
                mutateComment={mutateComment}
                deleteComment={deleteComment}
                isPlaceholder={false}
                threadEditing={threadEditing}
                setThreadEditing={setThreadEditing}
              />
            </Provider>
          ))}
        {!isPlaceholder && (
          <Stack direction="row-reverse">
            {canResolve && (
              <Tooltip content="Mark as resolved" placement="top">
                <TinyButton
                  onClick={handleResolved}
                  dataCy={`Thread:${threadId}:Resolved`}
                  aria-label="Mark as resolved"
                >
                  {commentThread?.resolved ? (
                    <GoIssueClosed className="h-4 w-4 text-green dark:text-green-600" />
                  ) : (
                    <GoIssueClosed className="h-4 w-4" />
                  )}
                </TinyButton>
              </Tooltip>
            )}
            {!threadEditing && (
              <Tooltip content="Reply in thread" placement="top">
                <TinyButton
                  onClick={handleReply}
                  aria-label="Reply in thread"
                  dataCy={`Thread:${threadId}:ReplyButton`}
                >
                  <BiReply className="h-4 w-4" data-cy={`Thread:${threadId}:Reply`} />
                </TinyButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </dialog>
    )
  }

  return (
    <div className="relative" id={`comment-thread-${threadId}`}>
      <div className="flex justify-end opacity-50 md:opacity-100 xl:justify-start" ref={triggerRef}>
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
      {renderPopup()}
    </div>
  )
}

export default Thread
