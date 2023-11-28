import { Avatar, Button, Card, Dropdown, Tabs, Tooltip } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from './Content'
import { Comment } from 'pages/api/comment/[commentId]'
import { useForm } from 'react-hook-form'
import Textarea from 'components/forms/Textarea'
import { MdDelete, MdEdit, MdPreview, MdSave } from 'react-icons/md'
import useProfile from 'lib/hooks/useProfile'
import { useSession } from 'next-auth/react'
import { putComment } from 'lib/actions/putComment'
import Stack from 'components/ui/Stack'
import { TinyButton } from './Thread'
import deleteCommentAction from 'lib/actions/deleteComment'
import useUser from 'lib/hooks/useUser'
import { useRecoilState, atom } from 'recoil'


export const textAreaValue = atom({
  key: 'textAreaValue',
  default: '',
});

interface Props {
  comment: Comment
  mutateComment: (comment: Comment) => void
  deleteComment: (comment: Comment) => void
  saveComment?: (placeholder: Comment) => void
  isPlaceholder?: boolean
}

const CommentView = ({ comment, mutateComment, deleteComment, isPlaceholder, saveComment}: Props) => {
  const { control, handleSubmit, reset } = useForm<Comment>();
  const { userProfile, isLoading, error } = useProfile()
  const [ editing, setEditing ] = useState(comment.markdown === '')
  const { user, isLoading: userIsLoading, error: userError  } = useUser(comment.createdByEmail);
  const hasEditPermission = userProfile?.admin || userProfile?.email === comment.createdByEmail
  const showProfile = comment.index !== 0


  useEffect(() => {
    reset(comment);
  }, [comment, reset]);

  const onSubmit = (data: Comment) => {
    putComment(data).then((comment) => {
      reset(comment)
      mutateComment(comment)
    });
    setEditing(false)
  }

  const onSubmitPlaceholder = (data: Comment) => {
    if (!saveComment) return
    saveComment(data)
    setEditing(false)
  }

  const onEdit = () => {
    setEditing(true)
  }

  const onDelete = () => {
    deleteCommentAction(comment.id).then((comment) => {
      deleteComment(comment)
    });
  }

  const [textareaValue, setTextareaValue] = useRecoilState(textAreaValue);
  
  const handleTextareaValueChange = (newValue: string) => {
    // This function will be called whenever the Textarea component's value changes
    setTextareaValue(newValue);
  };
  return (
    <form>
    <div className="mx-1 p-1 border border-gray-200 rounded-lg bg-slate-100 dark:bg-slate-800 dark:border-gray-700 mb-4" data-cy={`Comment:${comment.id}:Main`}>
      { (editing && hasEditPermission) ? (
      <div data-cy={`Comment:${comment.id}:Editing`}>
        <Textarea control={control} 
                  name="markdown" />
        <Stack direction='row-reverse'>
          {!isPlaceholder && (
            <TinyButton onClick={handleSubmit(onSubmit)} disabled={!textareaValue}><MdSave data-cy={`Comment:${comment.id}:Save`} /></TinyButton>
          )}
          {isPlaceholder && saveComment && (
            <TinyButton onClick={handleSubmit(onSubmitPlaceholder)} disabled={!textareaValue}><MdSave data-cy={`Comment:${comment.id}:Save`} /></TinyButton>
          )}
        </Stack>
      </div>
      ) : (
        <div className='relative' data-cy={`Comment:${comment.id}:Viewing`}>
        { showProfile && (
          <div className="absolute -top-4 -right-1 not-prose">
            <Tooltip content={(
              <>
              <span className="block text-sm">
                {user?.name} 
              </span>
              <span className="block truncate text-sm font-medium">
                {comment?.createdByEmail}
              </span>
              <span className="block text-sm">
                {comment?.created ? new Date(comment?.created).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short'}) : ""}
              </span>
              </>
            )}>
              <Avatar size="xs" rounded img={user?.image || undefined} />
            </Tooltip>
          </div>
        )}
        {!isPlaceholder && (
          <Markdown markdown={comment.markdown} />
        )}
        {isPlaceholder && (
          <Markdown markdown='' />
          )}
        { hasEditPermission && (
          <Stack direction='row-reverse'>
          {!isPlaceholder &&  (
            <>
              <Tooltip content="Edit comment">
                <TinyButton onClick={onEdit} dataCy={`Comment:${comment.id}:Edit`}><MdEdit /></TinyButton> 
              </Tooltip>
              <Tooltip content="Delete comment">
                <TinyButton onClick={onDelete} dataCy={`Comment:${comment.id}:Delete`}><MdDelete /></TinyButton> 
              </Tooltip>
            </>
          )}
          </Stack>
        )}
        </div>
      )}
      </div>
    </form>
  )
}

export default CommentView;
