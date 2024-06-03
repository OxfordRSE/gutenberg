import type { NextPage, GetStaticProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"
import { EventFull as Event } from "lib/types"

type HomeProps = {
  material: Material
  events: Event[]
}

const Home: NextPage<HomeProps> = ({ material, events }) => {
  return (
    <Layout material={material}>
      <Content markdown={material.markdown} />
      <NavDiagram material={material} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      return []
    })
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
    },
  }
}

export default Home
