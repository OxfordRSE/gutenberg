import React, { useEffect } from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Course, Material, Section, Theme, eventItemSplit } from 'lib/material'
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

type Props = {
    event: EventFull,
    material: Material,
}




// a table of eventItems vs users showing which users have completed which problems
const EventProblems: React.FC<Props> = ({ material, event }) => {
  const { users, error: usersError } = useUsersOnEvent(event.id);
  const { problems, error: problemsError } = useProblems(event.id);

  if (usersError || problemsError) return <div>failed to load</div> 
  if (!users || !problems) return <div>loading...</div>
  const students = users.filter((user) => user.status === 'STUDENT')

  return (
    <Table className='border dark:border-gray-700'>
      <Table.Head>
        <Table.HeadCell>
            Problem
        </Table.HeadCell>
        { students?.map((user) => (
          <Table.HeadCell key={user.userEmail} align="center">
            <Tooltip className={'normal-case'} content={`${user?.user?.name} <${user?.userEmail}>`} placement="top">
            <Avatar
              img={user?.user?.image || undefined}
              rounded={true}
              size="sm"
            />
            </Tooltip>
          </Table.HeadCell>
        ))}
      </Table.Head>
      <Table.Body className="divide-y">
        { event.EventGroup.map((eventGroup) => (
            <React.Fragment key={eventGroup.id}>
            <Table.Row className="" key={eventGroup.id}>
                <Table.Cell className="">
                    {eventGroup.name}
                </Table.Cell>
            </Table.Row>
            { eventGroup.EventItem.map((eventItem) => {
                const { theme, course, section, url } = eventItemSplit(eventItem, material)
                return (
                <React.Fragment key={eventItem.id}>
                { section && section.problems.map((problem) => (
                    <React.Fragment key={problem}>
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={`${eventGroup.id}-${eventGroup.id}-${problem}`}>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white" key={`title-${problem}${eventItem.section}`}>
                      {url ? (
                        <a href={`${url}#${problem}`}>{problem}</a>
                      ) : (
                        <span>{problem}</span>
                      )}
                    </Table.Cell>
                    { students?.map((user, i) => {
                        const problemStruct = problems.find((p: Problem) => p.userEmail === user.userEmail && p.tag === problem)
                        const problemStr = `difficulty: ${problemStruct?.difficulty} notes: ${problemStruct?.notes}`
                        return (
                          <Table.Cell key={`${user.userEmail}${problem}${eventItem.section}`} align='center' className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {(!problems && problemStruct && problemStruct.complete) ? 
                              <Tooltip content={problemStr} placement="top">✅</Tooltip> :
                              '❌'
                            }
                          </Table.Cell>
                        )
                     })}
                    </Table.Row>
                    </React.Fragment>
                ))}
                </React.Fragment>
            )})}
            </React.Fragment>
        ))}
      </Table.Body>
    </Table>
  )
}

export default EventProblems;



