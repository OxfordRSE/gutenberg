import React, { useEffect } from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Course, Material, Section, Theme, eventItemSplit, sectionSplit } from 'lib/material'
import { EventFull, Event, Problem } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import Title from 'components/ui/Title'
import { Avatar, Button, Card, Table, Timeline, Tooltip } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { MdClose } from 'react-icons/md'
import Link from 'next/link';
import EventItemView from './EventItemView';
import { useFieldArray, useForm } from 'react-hook-form';
import SelectField from './forms/SelectField';
import { EventItem } from '@prisma/client';
import useUsers from 'lib/hooks/useUsers';
import { useProblems } from 'lib/hooks/useProblems';
import useUsersOnEvent from 'lib/hooks/useUsersOnEvent';
import useCommentThreads from 'lib/hooks/useCommentThreads';
import SubTitle from './ui/SubTitle';

type Props = {
    event: EventFull,
    material: Material,
}

const EventCommentThreads: React.FC<Props> = ({ material, event }) => {
  const { commentThreads, error: threadsError, isLoading: threadsIsLoading} = useCommentThreads(event.id);
  if (threadsIsLoading) return <div>loading...</div>
  if (!commentThreads) return <div>failed to load</div>

  const unresolvedThreads = commentThreads.filter((thread) => !thread.resolved)

  return (
    <div>
      <ul className="list-disc text-gray-800 dark:text-gray-300" >
        { unresolvedThreads.map((thread) => {
          const { theme, course, section, url } = sectionSplit(thread.section, material)
          const urlWithAnchor = url + `#comment-thread-${thread.id}`
          return (
            <li key={thread.id}>
              <Link href={urlWithAnchor}>
                <span className="font-bold">{thread.section}:</span> {thread.createdByEmail}: {thread.Comment[0].markdown}
              </Link>
            </li>
          )
      })}
      </ul>
    </div>
  )
}

export default EventCommentThreads;

