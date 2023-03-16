import type { NextPage, GetStaticProps } from 'next'
import prisma from 'lib/prisma'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import { EventFull as Event } from 'lib/types';
import { Button, Card } from 'flowbite-react'
import Link from 'next/link'

type HomeProps = {
  material: Material,
  events: Event[],
}


const Home: NextPage<HomeProps> = ({ material, events }) => {
  return (
    <Layout material={material} events={events}>
      <div className="grid grid-cols-2 gap-4">
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Course Events
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Please login to see the upcoming course eventsa in the lhs sidebar
        </p>
      </Card>
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Course Material
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Put a description of the course material here. 
        </p>
        <Link href="/material">
        <Button>
          Read more
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
        </Link>
      </Card>
      </div>
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
