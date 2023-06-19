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
import { Avatar, Button, Card } from 'flowbite-react'
import EventUsers from 'components/EventUsers'
import { ResponseData as UserOnEventResponse } from 'pages/api/userOnEvent/[eventId]'
import EventProblems from 'components/EventProblems'

type EventProps = {
  material: Material,
  event: Event,
}

const myEventsFetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())
const eventsFetcher: Fetcher<Event[], string> = url => fetch(url).then(r => r.json())
const userOnEventFetcher: Fetcher<UserOnEventResponse, string> = url => fetch(url).then(r => r.json())

const Event: NextPage<EventProps> = ({ material, event }) => {

  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const { data: events, error: eventsError } = useSWR(`${basePath}/api/event`, eventsFetcher)
  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])
  const thisEvent = events ? events.find((e) => e.id == event.id) : undefined
  const { data: userOnEvent, error: userOnEventError } = useSWR(`${basePath}/api/userOnEvent/${event.id}`, userOnEventFetcher)
  const isInstructor = userOnEvent && typeof userOnEvent.userOnEvent !== 'string' && userOnEvent.userOnEvent.status === 'INSTRUCTOR';
  const thisEventFull=  myEvents ? myEvents.find((e) => e.id == event.id) : undefined
  return (
    <Layout material={material} activeEvent={activeEvent}>
      <Title text={event.name} />
      <div className='flex items-center justify-center'>
      <EventActions activeEvent={activeEvent} setActiveEvent={setActiveEvent} event={event} myEvents={myEvents} material={material} />
      </div>
      <Content markdown={thisEvent ? thisEvent.content : event.content} />
      { (isInstructor && thisEventFull) && (
        <div className={"flex-col items-center space-y-4"}>
          <EventUsers event={event}/> 
          <EventProblems event={thisEventFull} material={material} /> 
        </div>
      )}
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
