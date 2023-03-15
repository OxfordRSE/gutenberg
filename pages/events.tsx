import type { NextPage, GetStaticProps, GetServerSideProps } from 'next'
import prisma from '../lib/prisma'
import { useState, useEffect, useLayoutEffect } from 'react'
import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"


import { authOptions } from "./api/auth/[...nextauth]"


import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title';
import { Button, Timeline } from 'flowbite-react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Event, EventFull } from 'lib/types'
import { useActiveEvent } from 'lib/hooks'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import Link from 'next/link';


type EventsProps = {
  material: Material,
  events: Event[],
}

const fetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const Home: NextPage<EventsProps> = ({ material, events }) => {
  const { data: myEvents, error } = useSWR(`${basePath}/api/events`, fetcher)

  const [activeEvent, setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])

  const handleActivate = (event: Event) => () => {
    setActiveEvent(event)
  }
  const handleDeactivate = (event: Event) => () => {
    console.log('deactivate', activeEvent)
    setActiveEvent(null)
  }
  console.log(events)
  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
  }
  
  const myEventIds = myEvents ? myEvents.map((event) => event.id) : []
  return (
    <Layout>
      <Title text={"Available Courses"} />
      <Timeline>
        {error && <div>Failed to load my events</div>}
        {events.map((event) => (
        <Timeline.Item key={event.id}>
          <Timeline.Point />
          <Timeline.Content>
            <Timeline.Time>
              {event.start.toUTCString()}
            </Timeline.Time>
            <Timeline.Title>
              {event.name}
            </Timeline.Title>
            <Timeline.Body>
              {event.summary}
            </Timeline.Body>
            { myEventIds.includes(event.id) && (
              <div className="flex flex-row gap-2">
                {activeEvent?.id !== event.id ? (
                  <Button color="gray" onClick={handleActivate(event)}>
                    Activate
                  </Button>
                ) : (
                  <Button color="gray" onClick={handleDeactivate(event)}>
                    Deactivate
                  </Button>
                )}
                <Link href={`/event/${event.id}/`} >
                <Button color="gray">
                  Go to event
                  <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                </Button>
                </Link>
              </div>
            )}
          </Timeline.Content>
        </Timeline.Item>
      ))}
      </Timeline>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const events = await prisma.event.findMany();
  let material = await getMaterial()
  remove_markdown(material, material);
  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
    },
  }
}

export default Home
