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
import Link from 'next/link'
import { useActiveEvent } from 'lib/hooks/useActiveEvents'

type EventGroupProps = {
  material: Material,
  event: Event,
  eventGroupId: number,
}

const myEventsFetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const EventGroupPage: NextPage<EventGroupProps> = ({ material, event, eventGroupId }) => {

  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const [activeEvent , setActiveEvent] = useActiveEvent()
  const thisEvent = myEvents ? myEvents.find((e) => e.id == event.id) : undefined
  const eventGroup = thisEvent ? thisEvent.EventGroup.find((e) => e.id == eventGroupId) : undefined 

  return (
    <Layout material={material} activeEvent={activeEvent}>
      { eventGroup ? (
        <>
          <Title text={`${eventGroup.name} in ${event.name}`} />
          <Content markdown={eventGroup.content} />
        </>
      ) : (
        <>
          <Title text={event.name} />
          <p>
            You are not enrolled on this event, please see the main <Link href={`/event/${event.id}`}>event page</Link> for more information.
          </p>
        </>
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await prisma.event.findMany({include: { EventGroup: true }}).catch((e) => []);
  let paths = []
  for (let event of events) {
    for (let eventGroup of event.EventGroup) {
        paths.push({ params: { eventId: `${event.id}`, eventGroupId: `${eventGroup.id}` } })
    }
  }
  return {
    paths,
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const eventId = parseInt(context?.params?.eventId as string);
  const eventGroupId = parseInt(context?.params?.eventGroupId as string);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { notFound: true };
  }

  let material = await getMaterial();

  remove_markdown(material, undefined)

  return { 
    props: makeSerializable({ event, material, eventGroupId }),
  }
}

export default EventGroupPage; 
