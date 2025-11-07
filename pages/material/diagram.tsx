import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { material2Html } from "lib/markdown"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"
import { EventFull as Event } from "lib/types"

type HomeProps = {
  material: Material
  events: Event[]
  html: string
}

const Home: NextPage<HomeProps> = ({ material, events, html }) => {
  return (
    <Layout material={material} html={html}>
      <Content html={html} />
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
  const html = material2Html(material.markdown)
  removeMarkdown(material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      html: makeSerializable(html),
    },
  }
}

export default Home
