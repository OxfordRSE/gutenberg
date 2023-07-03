import type { NextPage, GetStaticProps } from 'next'
import prisma from 'lib/prisma'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import { basePath } from 'lib/basePath'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import { EventFull, Event } from 'lib/types';
import { Button, Card } from 'flowbite-react'
import Link from 'next/link'
import EventsView from 'components/EventsView'
import useSWR, { Fetcher } from 'swr'
import { useActiveEvent, useProfile } from 'lib/hooks'
import ExternalLink from 'components/ui/ExternalLink'
import { useMyEvents } from './api/eventFull'

type HomeProps = {
  material: Material,
  events: Event[],
}


const Home: NextPage<HomeProps> = ({ material, events }) => {
  const { events: myEvents, error: myEventsError, isLoading: myEventsLoading } = useMyEvents();
  const [activeEvent , setActiveEvent] = useActiveEvent()

  const linkClassName = "text-blue-500 hover:underline"
  return (
    <Layout material={material} activeEvent={activeEvent}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32  grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Course Events
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Login to request a place on an upcoming course, or to select an active course.
        </p>
        <EventsView 
          material={material} events={events} myEvents={myEvents} setActiveEvent={setActiveEvent} activeEvent={activeEvent}
        />
      </Card>
      <Card className='z-60'>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Course Material
        </h5>
        <div className="font-normal text-gray-700 dark:text-gray-400">

          <p className="pb-2">
          This is the teaching website for the <ExternalLink href="https://www.rse.ox.ac.uk/"> Oxford Research Software
          Engineering Group</ExternalLink>. Please see our list of past and upcoming courses
          on the left.</p>

          <p className="pb-2">The material for these courses is generated from a 
          set of <ExternalLink href="https://github.com/UNIVERSE-HPC/course-material">markdown materials</ExternalLink> collated by 
          the <ExternalLink href="https://universe-hpc.github.io/">UNIVERSE-HPC project</ExternalLink>,
          a joint collaboration between RSE teams at Oxford, Southhampton,
          Imperial and Edinburgh, the Software Sustainability Institute and the
          Edinburgh Parallel Computing Centre.</p>
          
          <p className="pb-2">These materials have been
          collated from a variety of sources published under different <ExternalLink href="https://creativecommons.org/about/cclicenses/">CC-BY</ExternalLink> licenses. The
          attributions for each course and section are given on the relevant
          pages, alongside the exact license of the original work.</p>

          {/* <p>To see a graph of all the materials provided here and the dependencies between them, click on the button below</p> */}
        </div>
        <Button href={`${basePath}/material`}>
          <p>View the teaching materials</p>
          <svg
            className="ml-2 -mr-1 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </Card>
      </div>
    </Layout>
  )
}



export const getStaticProps: GetStaticProps = async (context) => {
  
  const events = await prisma.event.findMany().catch((e) => {
    console.log('error', e);
    return [];
  });
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
