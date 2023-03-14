import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import prisma from 'lib/prisma'
import { Prisma, PrismaClient } from "@prisma/client";
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import { useActiveEvent } from 'lib/hooks';
import { Event } from 'lib/types';

import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'



type HomeProps = {
  material: Material,
}


const fetcher: Fetcher<Event[], string> = url => fetch(url).then(r => r.json())

const Home: NextPage<HomeProps> = ({ material }) => {
  const { data: events, error } = useSWR(`${basePath}/api/events`, fetcher)
  const [activeEvent, setActiveEvent] = useActiveEvent(events ? events: [])

  return (
    <Layout activeEvent={activeEvent ? activeEvent : undefined}>
      <Content markdown={material.markdown} />
      <NavDiagram material={material}/>
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
