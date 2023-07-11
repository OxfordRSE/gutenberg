import { Button, ButtonProps, Card } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from './Content'
import { CommentThread } from 'pages/api/commentThread'
import Comment from './Comment'
import { BiCommentDetail, BiReply } from 'react-icons/bi'
import { IoClose } from 'react-icons/io5'
import { post } from 'cypress/types/jquery'
import postComment from 'lib/actions/postComment'
import useCommentThread from 'lib/hooks/useCommentThread'

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
}

const Thread = ({ thread, active, setActive}: ThreadProps) => {
  const { commentThread, error, isLoading, mutate } = useCommentThread(thread.id)
  
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

  return (
    <div className="relative">
    <TinyButton onClick={handleOpen}>
      <BiCommentDetail className='text-slate-500 dark:text-slate-500'/>
    </TinyButton>
    { active && (
    <div className="absolute ml-8 top-0 w-[360px] border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-gray-700 mb-4 z-50">
      <div className={`flex items-center justify-between rounded-t-lg`}>
        <h3 className="w-full mx-2 my-0 text-base text-slate-100 dark:text-slate-900">{}</h3>
         <div className='flex items-center space-x-2 mr-2'>
            <TinyButton onClick={handleClose}>
              <IoClose className="" />
            </TinyButton>
          </div>
      </div>
      { commentThread?.Comment.map((comment) => (
        <>
        <Comment key={comment.id} comment={comment} active={active} mutateComment={mutateComment}/>
        </>
      ))}
      <div className={`flex items-center justify-between rounded-b-lg`}>
        <TinyButton onClick={handleReply}>
          <BiReply className="h-4 w-4" />
        </TinyButton>
      </div>
    </div>
    )}
    </div>
  )
}

export default Thread;