import type { NextPage, GetStaticProps } from 'next'
import prisma from 'lib/prisma'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import { EventFull as Event, EventFull } from 'lib/types';
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import useActiveEvent from 'lib/hooks/useActiveEvents'

type HomeProps = {
  material: Material,
  events: Event[],
}

const Home: NextPage<HomeProps> = ({ material, events }) => {
  return (
    <Layout material={material}>
      <Content markdown={material.markdown} />
      <NavDiagram material={material}/>
    </Layout>
  )
}


export const getStaticProps: GetStaticProps = async (context) => {
  const events = await prisma.event.findMany({
    where: { hidden: false },
  }).catch((e) => {
    return []
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
