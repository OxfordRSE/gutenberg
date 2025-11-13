import { Stack } from "@mui/system"
import Avatar from "@mui/material/Avatar"
import { Tooltip, Dropdown } from "flowbite-react"
import { Provider } from "jotai"
import { FC, Ref, useMemo, useRef, useState } from "react"
import { BiDotsVerticalRounded, BiReply } from "react-icons/bi"
import { GoIssueClosed } from "react-icons/go"
import { ImEyeBlocked, ImEye } from "react-icons/im"
import { IoClose } from "react-icons/io5"
import { MdDelete } from "react-icons/md"

import { CommentThread, Comment } from "pages/api/commentThread"
import postComment from "lib/actions/postComment"
import deleteCommentThread from "lib/actions/deleteThread"
import putCommentThread from "lib/actions/putCommentThread"
import CommentView from "./Comment"
import { TinyButton } from "./Thread"
import useUser from "lib/hooks/useUser"

interface ThreadDialogProps {
  active: boolean
  setActive: (active: boolean) => void
  canEdit: boolean
  canResolve: boolean
  commentThread: CommentThread
  finaliseThread: (thread: CommentThread, comment: Comment) => void
  handleClose: () => void
  isPlaceholder: boolean
  mutate: (commentThread: CommentThread) => void
  onDelete: () => void
  ref?: Ref<HTMLDialogElement>
}

const ThreadDialog: FC<ThreadDialogProps> = ({
  active,
  setActive,
  canEdit,
  canResolve,
  commentThread,
  finaliseThread,
  handleClose,
  isPlaceholder,
  mutate,
  onDelete,
  ref,
}) => {
  const [threadEditing, setThreadEditing] = useState(false)
  const { user } = useUser(commentThread?.createdByEmail)

  const threadId = commentThread.id

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

  const sortedComments = useMemo(() => {
    if (!commentThread) return []
    return commentThread.Comment.sort((a, b) => a.index - b.index)
  }, [commentThread])

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
  return (
    <dialog
      aria-label="Comments"
      open={active}
      ref={ref}
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
              <TinyButton onClick={handleResolved} dataCy={`Thread:${threadId}:Resolved`} aria-label="Mark as resolved">
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
              <TinyButton onClick={handleReply} aria-label="Reply in thread" dataCy={`Thread:${threadId}:ReplyButton`}>
                <BiReply className="h-4 w-4" data-cy={`Thread:${threadId}:Reply`} />
              </TinyButton>
            </Tooltip>
          )}
        </Stack>
      )}
    </dialog>
  )
}

export default ThreadDialog
