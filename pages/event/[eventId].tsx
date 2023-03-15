import type { NextPage, GetStaticProps, GetServerSideProps, GetStaticPaths  } from 'next'
import prisma from 'lib/prisma'

import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title';
import { Button, ListGroup, Timeline } from 'flowbite-react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { EventFull, Event } from 'lib/types'
import { useActiveEvent } from 'lib/hooks'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import EventView from 'components/EventView'


type EventsProps = {
  material: Material,
  eventId: number
}

const fetcher: Fetcher<EventFull[] | null, string> = url => fetch(url).then(r => r.json())

const Page: NextPage<EventsProps> = ({ material, eventId }) => {
  const { data: events, error } = useSWR(`${basePath}/api/events`, fetcher)
  
  if (error) return (
   <Layout>
      <div>Failed to load</div>
   </Layout>
  )
  if (!events) return (
   <Layout>
      <div>Loading...</div>
   </Layout>
  )
  const event = events.find((e) => e.id === eventId)
  
  if (!event) return (
   <Layout>
      <div>Cannot find event...</div>
   </Layout>
  )

  for (let i = 0; i < event.EventGroup.length; i++) {
    event.EventGroup[i].start = new Date(event.EventGroup[i].start)
    event.EventGroup[i].end = new Date(event.EventGroup[i].end)
    event.EventGroup[i].EventItem.sort((a, b) => {
      return a.order - b.order
    })
  }
  event.EventGroup.sort((a, b) => {
    return a.start > b.start ? 1 : -1
  });

  return (
    <Layout>
     <EventView material={material} event={event} /> 
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  let events: Event[] = []
  events = await prisma.event.findMany();
  return {
    paths: events.map((e) => ({ params: { eventId: `${e.id}` } })),
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  let material = await getMaterial()
  remove_markdown(material, material);
  const eventId = parseInt(context?.params?.eventId as string)
  return {
    props: {
      material: makeSerializable(material),
      eventId,
    },
  }
}

export default Page
