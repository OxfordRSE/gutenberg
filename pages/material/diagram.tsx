import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import Content from "components/content/Content"
import NavDiagram from "components/navdiagram/NavDiagram"
import { EventFull as Event } from "lib/types"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"

type HomeProps = {
  material: Material
  events: Event[]
  pageInfo: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo}>
      <Content markdown={material.markdown} />
      <NavDiagram material={material} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = loadPageTemplate()
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
