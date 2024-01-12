import type { NextPage, GetStaticProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, remove_markdown } from "lib/material"
import Content from "components/content/Content"
import NavDiagram from "components/NavDiagram"
import { EventFull as Event, EventFull } from "lib/types"
import useSWR, { Fetcher } from "swr"
import { basePath } from "lib/basePath"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Button, Card, theme } from "flowbite-react"
import { concat } from "cypress/types/lodash"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"

type HomeProps = {
  material: Material
  events: Event[]
  pageInfo?: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, pageInfo }) => {
  const themeCards = generateThemeCards(material)
  return (
    <Layout material={material} pageInfo={pageInfo}>
      <div className="items-stretch px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {themeCards}
      </div>
    </Layout>
  )
}

function generateThemeCards(material: Material) {
  const cards = material.themes.map((theme, index) => (
    <Card key={theme.repo + theme.id} href={`${basePath}/material/${theme.repo}/${theme.id}`} className="w-90%">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{theme.name}</h5>
      <p>{theme.summary}</p>
    </Card>
  ))

  return cards
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
  remove_markdown(material, material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      pageInfo: makeSerializable(pageInfo),
    },
  }
}

export default Home
