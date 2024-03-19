import type { NextPage, GetStaticProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown, getExcludes } from "lib/material"
import { EventFull as Event } from "lib/types"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"
import ThemeCards from "components/ThemeCards"

type HomeProps = {
  material: Material
  events: Event[]
  pageInfo?: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo}>
      <ThemeCards material={material} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
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
      pageInfo: makeSerializable(pageInfo),
    },
  }
}

export default Home
