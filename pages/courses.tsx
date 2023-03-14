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
import { Event } from 'lib/types'
import { useActiveEvent } from 'lib/hooks'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'


type EventsProps = {
  material: Material,
}

function getStateDate(event: Event) {
  const dates = event.EventGroup.map((group) => {
    return new Date(group.start)
  });
  const startDate = dates.reduce(function (a, b) { return a < b ? a : b; }, new Date());
  return startDate;
}

const fetcher: Fetcher<Event[], string> = url => fetch(url).then(r => r.json())

const Home: NextPage<EventsProps> = ({ material }) => {
  const { data: events, error } = useSWR(`${basePath}/api/events`, fetcher)

  const [activeEvent, setActiveEvent] = useActiveEvent(events ? events: [])

  const handleActivate = (event: Event) => () => {
    setActiveEvent(event)
  }

  const eventsWithStart = !events ? [] : events.map((event) => ({
    ...event,
    start: getStateDate(event),
  }));

  return (
    <Layout>
      <Title text={"Available Courses"} />
      <Timeline>
        {error && <div>Failed to load</div>}
        {eventsWithStart.map((event) => (
        <Timeline.Item key={event.id}>
          <Timeline.Point />
          <Timeline.Content>
            <Timeline.Time>
              {event.start.toLocaleDateString()}
            </Timeline.Time>
            <Timeline.Title>
              {event.name}
            </Timeline.Title>
            <Timeline.Body>
              {event.summary}
            </Timeline.Body>
            <Button color="gray" onClick={handleActivate(event)}>
              Activate
              <HiArrowNarrowRight className="ml-2 h-3 w-3" />
            </Button>
            {activeEvent?.id === event.id && (
              <Timeline>
              {event.EventGroup.map((group) => (
              <Timeline.Item key={group.id}>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>
                    {new Date(group.start).toLocaleDateString()}
                  </Timeline.Time>
                  <Timeline.Title>
                    {group.name}
                  </Timeline.Title>
                  <Timeline.Body>
                    {group.summary}
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            ))}
            </Timeline>
            )}
          </Timeline.Content>
        </Timeline.Item>

      ))}
      </Timeline>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  let material = await getMaterial()
  remove_markdown(material, material);
  return {
    props: {
      material: makeSerializable(material),
    },
  }
}

export default Home
