import React, { useEffect } from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Course, Material, Section, Theme } from 'lib/material'
import { EventFull, Event, Problem } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import Title from 'components/Title'
import { Avatar, Button, Card, Table, Timeline, Tooltip } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { MdClose } from 'react-icons/md'
import Link from 'next/link';
import EventItemView from './EventItemView';
import { UsersWithUserOnEvents } from 'pages/api/event/[eventId]/users';
import { Data as ProblemsResponse, useProblems} from 'pages/api/event/[eventId]/problems';
import { useFieldArray, useForm } from 'react-hook-form';
import SelectField from './forms/SelectField';
import { EventItem } from '@prisma/client';
import { useUsers } from 'pages/api/user';

type Props = {
    event: EventFull,
    material: Material,
}

const eventItemSplit = (eventItem: EventItem, material: Material): { theme?: Theme, course?: Course, section?: Section, url?: string } => {
    const split = eventItem.section.split('.')
    if (split.length === 3) {
        const theme = material.themes.find((theme) => theme.id === split[0])
        const course = theme?.courses.find((course) => course.id === split[1])
        const section = course?.sections.find((section) => section.id === split[2])
        const url = `${basePath}/material/${split[0]}/${split[1]}/${split[2]}`
        return {
            theme,
            course,
            section,
            url,
        }
    } else if (split.length === 2) {
        const theme = material.themes.find((theme) => theme.id === split[0])
        const course = theme?.courses.find((course) => course.id === split[1])
        const url = `${basePath}/material/${split[0]}/${split[1]}`
        return {   
            theme,
            course,
            url,
        }
    } else if (split.length === 1) {
        const theme = material.themes.find((theme) => theme.id === split[0])
        const url = `${basePath}/material/${split[0]}`
        return {
            theme,
            url,
        }
    }
    return {}
}


const usersFetcher: Fetcher<{ users: UsersWithUserOnEvents[]}, string> = url => fetch(url).then(r => r.json())
const problemsFetcher: Fetcher<ProblemsResponse, string> = url => fetch(url).then(r => r.json())

// a table of eventItems vs users showing which users have completed which problems
const EventProblems: React.FC<Props> = ({ material, event }) => {
  const { users, error: usersError } = useUsers(event.id);
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
            <>
            <Table.Row className="">
                <Table.Cell className="">
                    {eventGroup.name}
                </Table.Cell>
            </Table.Row>
            { eventGroup.EventItem.map((eventItem) => {
                const { theme, course, section, url } = eventItemSplit(eventItem, material)
                return (
                <>
                { section && section.problems.map((problem) => (
                    <>
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
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
                    </>
                ))}
                </>
            )})}
            </>
        ))}
      </Table.Body>
    </Table>
  )
}

export default EventProblems;



