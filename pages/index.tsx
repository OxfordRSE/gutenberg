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
import { useActiveEvent } from 'lib/hooks'

type HomeProps = {
  material: Material,
  events: Event[],
}

const myEventsFetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())
const eventsFetcher: Fetcher<Event[], string> = url => fetch(url).then(r => r.json())

const Home: NextPage<HomeProps> = ({ material, events }) => {
  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const { data: currentEvents , error: currentEventserror } = useSWR(`${basePath}/api/event`, eventsFetcher)
  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])
  console.log('homepage: activeEvnet', activeEvent, events, currentEvents)
  if (currentEvents) {
    events = currentEvents;
  }
  const linkClassName = "text-blue-500 hover:underline"
  return (
    <Layout material={material} events={events} activeEvent={activeEvent}>
      <div className="pt-14 px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32  grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <Card  className='z-10'>
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
      <Card className='z-10'>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Course Material
        </h5>
        <div className="font-normal text-gray-700 dark:text-gray-400">

          <p className="pb-2">
          This is the teaching website for the <a href="https://www.rse.ox.ac.uk/" className={linkClassName}> Oxford Research Software
          Engineering</a> team. Please see our list of past and upcoming courses
          to the left.</p>

          <p className="pb-2">The material for these courses is generated from a 
          set of <a href="https://github.com/UNIVERSE-HPC/course-material" className={linkClassName}>markdown materials</a> collated by 
          the <a href="https://universe-hpc.github.io/" className={linkClassName}>UNIVERSE-HPC project</a>,
          a joint collaboration between RSE teams at Oxford, Southhampton,
          Imperial and Edinburgh, the Software Sustainability Institute and the
          Edinburgh Parallel Computing Centre.</p>
          
          <p className="pb-2">These materials have been
          collated from a variety of sources published under different <a href="https://creativecommons.org/about/cclicenses/" className={linkClassName}>CC-BY</a> licenses, the
          attributions for each course and section is given on the relevent
          pages, along with the exact license of the original work (click the @ symbol at the top right of each page).</p>

          <p>To see a graph of all the materials provided here and the dependencies between them, click on the button below</p>
        </div>
        <Button href={`${basePath}/material`}>
          <p>Go to the material</p>
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
    console.log(e);
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
