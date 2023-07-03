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
import { useActiveEvent } from 'lib/hooks'
import EventActions from 'components/EventActions'
import { UsersWithUserOnEvents } from 'pages/api/event/[eventId]/users'
import { Avatar, Button, Card, Tabs } from 'flowbite-react'
import EventUsers from 'components/EventUsers'
import { Data as UserOnEventResponse } from 'pages/api/userOnEvent/[eventId]'
import EventProblems from 'components/EventProblems'
import { useEvent, Event as EventWithUsers } from 'pages/api/event/[eventId]'
import { useForm, Controller } from "react-hook-form";
import { useSession } from 'next-auth/react'
import { useProfile } from 'pages/api/user'
import { MdEdit, MdPreview } from 'react-icons/md'
import Textfield from 'components/forms/Textfield'
import Textarea from 'components/forms/Textarea'
import DateTimeField from 'components/forms/DateTimeField'

type EventProps = {
  material: Material,
  event: Event,
}

const Event: NextPage<EventProps> = ({ material, event }) => {
  const { event: eventData, error: eventError, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile();
  const { control, handleSubmit, reset, setValue } = useForm<EventWithUsers>({ defaultValues: eventData });

  const myUserOnEvent = eventData?.UserOnEvent.find((e) => e.userEmail == session?.user?.email)
  const [activeEvent , setActiveEvent] = useActiveEvent()
  const isInstructor = myUserOnEvent?.status === 'INSTRUCTOR' || false;
  const isAdmin = userProfile?.admin;

  if (eventIsLoading) return <div>loading...</div>
  if (!eventData) return <div>Error getting event...</div>

  const eventView = (
    <>
      <Title text={event.name} />
      <div className='flex items-center justify-center'>
      <EventActions activeEvent={activeEvent} setActiveEvent={setActiveEvent} event={event} />
      </div>
      <Content markdown={eventData ? eventData.content : event.content} />
      <div className={"flex-col items-center space-y-4"}>
      { isAdmin && eventData && (
          <EventUsers event={event}/> 
      )}
      { ((isInstructor || isAdmin) && eventData ) && (
          <EventProblems event={eventData} material={material} /> 
      )}
      </div>
    </>
  )
  const eventEditView = (
    <>
      <Textfield label="Title" name="name" control={control} />
      <Textarea label="Enrol" name="enrol" control={control} />
      <Textarea label="Summary" name="summary" control={control} />
      <Textarea label="Content" name="content" control={control} />
      <DateTimeField label="Start" name="start" control={control} />
      <DateTimeField label="End" name="end" control={control} />
      <EventUsers event={event}/> 
    </>
  )
  return (
    <Layout material={material} activeEvent={activeEvent}>
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
