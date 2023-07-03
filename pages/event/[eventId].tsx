import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title'
import { Event, EventFull } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import EventActions from 'components/EventActions'
import { Avatar, Button, Card, Tabs } from 'flowbite-react'
import EventUsers from 'components/EventUsers'
import EventProblems from 'components/EventProblems'
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useSession } from 'next-auth/react'
import { MdEdit, MdPreview } from 'react-icons/md'
import Textfield from 'components/forms/Textfield'
import Textarea from 'components/forms/Textarea'
import DateTimeField from 'components/forms/DateTimeField'
import useEvent from 'lib/hooks/useEvent'
import useProfile from 'lib/hooks/useProfile'
import { Event as EventWithUsers } from 'pages/api/event/[eventId]'
import Stack from 'components/ui/Stack'
import { putEvent } from 'lib/actions/putEvent'
import { useEffect } from 'react'
import { Prisma } from '@prisma/client'
import SelectField from 'components/forms/SelectField'

type EventProps = {
  material: Material,
  event: Event,
}


const Event: NextPage<EventProps> = ({ material, event }) => {
  const { event: eventData, error: eventError, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)
  if (eventData) {
    event = eventData
  }
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile();
  const { control, handleSubmit, reset, setValue } = useForm<EventWithUsers>({ defaultValues: eventData });

  const { fields: eventGroups, append: appendGroup, remove: removeGroup } = useFieldArray({
    control,
    name: "EventGroup",
  });

  const { fields: eventUser } = useFieldArray({
    control,
    name: "UserOnEvent",
  });

  const myUserOnEvent = eventData?.UserOnEvent.find((e) => e.userEmail == session?.user?.email)
  const isInstructor = myUserOnEvent?.status === 'INSTRUCTOR' || false;
  const isAdmin = userProfile?.admin;

  const onSubmit = (data: EventWithUsers) => {
    putEvent(data).then((data) => data.event && mutateEvent(data.event));
  }

  useEffect(() => {
    reset(eventData);
  }, [eventData]);

  if (eventIsLoading) return <div>loading...</div>
  if (!eventData) return <div>Error getting event...</div>

  const handleAddGroup = () => {
    appendGroup({ id: 0, eventId: event.id, name: '', summary: '', content: '', start: event.start, end: event.end, location: '', EventItem: [] })
  }

  const handleRemoveGroup = (index: number) => () => {
    removeGroup(index)
  }

  const statusOptions = [
    { label: 'student', value: 'STUDENT' },
    { label: 'instructor', value: 'INSTRUCTOR' },
    { label: 'request', value: 'REQUEST' },
    { label: 'reject', value: 'REJECTED' },
  ]


  const eventView = (
    <>
      <Title text={event.name} />
      <Content markdown={eventData ? eventData.content : event.content} />
      <Title text={"Enroll"} />
      <Content markdown={event.enrol} />
      <div className='flex items-center justify-center'>
      <EventActions event={event} />
      </div>
      { ((isInstructor || isAdmin) && eventData ) && (
          <EventProblems event={eventData} material={material} /> 
      )}
    </>
  )
  const eventEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
    <Stack>
      <Textfield label="Title" name="name" control={control} />
      <Textarea label="Enrol" name="enrol" control={control} />
      <Textarea label="Summary" name="summary" control={control} />
      <Textarea label="Content" name="content" control={control} />
      <DateTimeField label="Start" name="start" control={control} />
      <DateTimeField label="End" name="end" control={control} />
      <Title text="Users" />
      <div className="grid grid-cols-4 gap-4">
      {eventUser.map((user, index) => (
        <div key={user.id} className='flex items-center space-x-4'>
          <div className="shrink-0">
          <Avatar
              img={user.user?.image || undefined}
              rounded={true}
              size="sm"
          />
          </div>
          <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {user.user?.name}
          </p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {user.user?.email}
          </p>
          </div>
          <SelectField control={control} name={`UserOnEvent.${index}.status`} options={statusOptions} />
        </div>
      ))}
      </div>
      <Title text="Groups" />
      <div className="grid grid-cols-3 items-end gap-4 ">
      {eventGroups.map((group, index) => (  
        <Stack key={group.id} >
          <Textfield label="Group Name" name={`EventGroup.${index}.name`} control={control} />
          <Textfield label="Group Summary" name={`EventGroup.${index}.summary`} control={control} />
          <Textfield label="Group Location" name={`EventGroup.${index}.location`} control={control} />
          <DateTimeField label="Start" name={`EventGroup.${index}.start`} control={control} />
          <DateTimeField label="End" name={`EventGroup.${index}.end`} control={control} />
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleRemoveGroup(index)}>Delete</Button>
            <Button>Edit</Button>
          </div>
        </Stack>
      ))}
        <Button onClick={handleAddGroup}>Add Group</Button>
      </div>
      <Button type="submit">Save</Button>
    </Stack>
    </form>
  )
  return (
    <Layout material={material}>
      { isAdmin ? (
        <Tabs.Group style="underline" >
        <Tabs.Item active icon={MdPreview} title="Event">
          {eventView}
        </Tabs.Item>
        <Tabs.Item icon={MdEdit} title="Edit">
          {eventEditView}
        </Tabs.Item>
        </Tabs.Group>
      ) : eventView}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await prisma.event.findMany().catch((e) => []);
  return {
    paths: events.map((e) => ({ params: { eventId: `${e.id}` } })),
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const eventId = parseInt(context?.params?.eventId as string);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { notFound: true };
  }

  let material = await getMaterial();

  remove_markdown(material, undefined)

  return { 
    props: makeSerializable({ event, material }),
  }
}

export default Event; 
