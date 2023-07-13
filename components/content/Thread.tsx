import { Avatar, Button, ButtonProps, Card, Dropdown, Tooltip } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from './Content'
import { CommentThread } from 'pages/api/commentThread'
import Comment from './Comment'
import { BiCommentDetail, BiDotsVerticalRounded, BiReply } from 'react-icons/bi'
import { IoClose } from 'react-icons/io5'
import { post } from 'cypress/types/jquery'
import postComment from 'lib/actions/postComment'
import useCommentThread from 'lib/hooks/useCommentThread'
import { MdDelete } from 'react-icons/md'
import deleteComment from 'lib/actions/deleteComment'
import Stack from 'components/ui/Stack'
import deleteCommentThread from 'lib/actions/deleteThread'
import { GoIssueClosed } from 'react-icons/go'
import { ImEyeBlocked } from 'react-icons/im'
import useUser from 'lib/hooks/useUser'

interface TinyButtonProps {
  children: React.ReactNode
  props?: ButtonProps
  onClick?: () => void
}

export const TinyButton = ({ children, ...props }: TinyButtonProps) => (
  <Button className="m-1 bg-slate-50 dark:bg-slate-800" {...props} size="xxs" pill={true}>
    {children}
  </Button>
)


interface ThreadProps {
  thread: CommentThread
  active: boolean
  setActive: (active: boolean) => void
  onDelete: () => void
}

const Thread = ({ thread, active, setActive, onDelete}: ThreadProps) => {
  const { commentThread, error: commentThreadError, isLoading: commentThreadIsLoading, mutate } = useCommentThread(thread.id)
  const { user, isLoading: userIsLoading, error: userError  } = useUser(commentThread?.createdByEmail);
  
  const mutateComment = (comment: Comment) => {
    if (!commentThread) return;
    mutate({ ...commentThread, Comment: commentThread.Comment.map((c) => c.id === comment.id ? comment : c) })
  }

  const handleOpen = () => {
    setActive(true);
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleReply = () => {
    if (!commentThread) return;
    postComment(thread.id).then((comment: Comment) => {
      mutate({ ...commentThread, Comment: [ ...commentThread.Comment, comment ] })
    });
  }

  const handleDelete = () => {
    if (!commentThread) return;
    deleteCommentThread(commentThread.id).then((commentThread: CommentThread) => {
      onDelete();
    });
  };

  const handleInstructorOnly = () => {
    if (!commentThread) return;
    console.log('handleInstructorOnly')
  };

  const handleResolved = () => {
    if (!commentThread) return;
    console.log('handleResolved')
  };

  return (
    <div className="relative">
      <div  className="flex justify-end opacity-50 md:opacity-100 xl:justify-start">
        <TinyButton onClick={handleOpen}>
          <BiCommentDetail className='dark:text-slate-500 text-slate-500'/>
        </TinyButton>
      </div>
    { active && (
    <div className="absolute ml-8 top-0 w-[355px] border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-gray-700 mb-4 z-50 ">
      <div className="absolute -top-0 -left-0 not-prose">
        <Tooltip content={(
          <>
          <span className="block text-sm">
            {user?.name} 
          </span>
          <span className="block truncate text-sm font-medium">
            {thread?.createdByEmail}
          </span>
          <span className="block text-sm">
            {thread?.created ? new Date(thread?.created).toUTCString() : ""}
          </span>
          </>
        )}>
        <Stack direction='row'>
          <Avatar size="xs" rounded img={user?.image || undefined} />
          <p className='font-bold ml-1'>{user?.name}</p>
        </Stack>
        </Tooltip>
      </div>
      <div className={`flex items-center justify-between rounded-t-lg`}>
        <h3 className="w-full mx-2 my-0 text-base text-slate-100 dark:text-slate-900">{}</h3>
          <Stack direction='row-reverse'>
            <TinyButton onClick={handleClose}>
              <IoClose className="" />
            </TinyButton>
            <Dropdown
              renderTrigger={() => (
                <TinyButton>
                  <BiDotsVerticalRounded className="h-4 w-4" />
                </TinyButton>
              )} label={undefined} 
              className='not-prose'
            >
              <Dropdown.Item icon={ImEyeBlocked} onClick={handleInstructorOnly}>
                Instructor View Only
              </Dropdown.Item>
              <Dropdown.Item icon={MdDelete} onClick={handleDelete}>
                Delete
              </Dropdown.Item>
            </Dropdown>
          </Stack>
      </div>
      { commentThread?.Comment.map((comment) => (
        <>
        <Comment key={comment.id} comment={comment} active={active} mutateComment={mutateComment}/>
        </>
      ))}
      <Stack direction='row-reverse'>
        
        <Tooltip content="Mark as Resolved" placement="top">
        <TinyButton onClick={handleResolved}>
          <GoIssueClosed className="h-4 w-4" />
        </TinyButton>
        </Tooltip>

        <Tooltip content="Reply in Thread" placement="top">
        <TinyButton onClick={handleReply}>
          <BiReply className="h-4 w-4" />
        </TinyButton>
        </Tooltip>
      </Stack>
    </div>
    )}
    </div>
  )
}

export default Thread;