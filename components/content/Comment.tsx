import { Avatar, Button, Card, Dropdown, Tabs, Tooltip } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from './Content'
import { Comment } from 'pages/api/comment/[commentId]'
import { useForm } from 'react-hook-form'
import Textarea from 'components/forms/Textarea'
import { MdDelete, MdEdit, MdPreview, MdSave } from 'react-icons/md'
import { use } from 'chai'
import useProfile from 'lib/hooks/useProfile'
import { useSession } from 'next-auth/react'
import { putComment } from 'lib/actions/putComment'
import Stack from 'components/ui/Stack'
import { TinyButton } from './Thread'
import { CommentThread } from '@prisma/client'
import deleteComment from 'lib/actions/deleteComment'
import useUser from 'lib/hooks/useUser'

interface Props {
  comment: Comment
  active: boolean
  mutateComment: (comment: Comment) => void
}

const Comment = ({ comment, active, mutateComment}: Props) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm<Comment>({ defaultValues: comment });
  const { userProfile, isLoading, error } = useProfile()
  const markdown = watch('markdown')
  const [ editing, setEditing ] = useState(comment.markdown === '')
  const { user, isLoading: userIsLoading, error: userError  } = useUser(comment.createdByEmail);
  const hasEditPermission = userProfile?.admin || userProfile?.email === comment.createdByEmail
  const showProfile = comment.index !== 0

  useEffect(() => {
    reset(comment);
  }, [comment]);

  const onSubmit = (data: Comment) => {
    putComment(data).then((data) => {
      if (data.comment) {
        reset(data.comment)
        mutateComment(data.comment)
      }
    });
    setEditing(false)
  }

  const onEdit = () => {
    setEditing(true)
  }

  const onDelete = () => {
    deleteComment(comment.id)
  }

  if (!active) {
    return (
      <Markdown markdown={markdown} />
    )
  }

  return (
    <form>
    <div className="mx-1 p-1 border border-gray-200 rounded-lg bg-slate-100 dark:bg-slate-800 dark:border-gray-700 mb-4">
      { (editing && hasEditPermission) ? (
      <>
        <Tabs.Group style="underline" className='p-0 m-0' >
          <Tabs.Item active icon={MdEdit} title="Edit">
            <Textarea control={control} name="markdown" />
          </Tabs.Item>
          <Tabs.Item icon={MdPreview} title="Preview">
            <Markdown markdown={markdown} />
          </Tabs.Item>
        </Tabs.Group>
        <Stack direction='row-reverse'>
          <TinyButton onClick={handleSubmit(onSubmit)}><MdSave /></TinyButton>
        </Stack>
      </>
      ) : (
        <div className='relative'>
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
                {comment?.created ? new Date(comment?.created).toUTCString() : ""}
              </span>
              </>
            )}>
              <Avatar size="xs" rounded img={user?.image || undefined} />
            </Tooltip>
          </div>
        )}
        <Markdown markdown={markdown} />
        { hasEditPermission && (
          <Stack direction='row-reverse'>
          <Tooltip content="Edit comment">
            <TinyButton onClick={onEdit}><MdEdit /></TinyButton> 
          </Tooltip>
          <Tooltip content="Delete comment">
            <TinyButton onClick={onDelete}><MdDelete /></TinyButton> 
          </Tooltip>
          </Stack>
        )}
        </div>
      )}
      </div>
    </form>
  )
}

export default Comment;
