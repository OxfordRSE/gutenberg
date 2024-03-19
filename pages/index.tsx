import type { NextPage, GetStaticProps } from "next"
import React from "react"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { basePath } from "lib/basePath"
import { Event } from "lib/types"
import { Button, Card } from "flowbite-react"
import EventsView from "components/EventsView"
import { pageTemplate, PageTemplate } from "lib/pageTemplate"
import { Markdown } from "components/content/Content"

type HomeProps = {
  material: Material
  events: Event[]
  pageInfo: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, pageInfo }) => {
  const intro = pageInfo.frontpage.intro

  const linkClassName = "text-blue-500 hover:underline"
  return (
    <Layout material={material} pageInfo={pageInfo}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32  grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="scroll" style={{ maxHeight: "82vh", overflowY: "auto" }}>
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Course Events</h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Login to request a place on an upcoming course, or to select an active course.
          </p>
          <EventsView material={material} events={events} />
        </Card>
        <Card className="z-60">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Course Material</h5>
          <div className="font-normal text-gray-700 dark:text-gray-400">{intro && <Markdown markdown={intro} />}</div>
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
  const pageInfo = pageTemplate

  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      console.log("error", e)
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
