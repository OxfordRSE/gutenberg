import type { GetStaticProps, NextPage } from "next"
import { signIn, useSession } from "next-auth/react"
import { Button, Card } from "flowbite-react"
import Layout from "components/Layout"
import EventsView from "components/timeline/EventsView"
import Title from "components/ui/Title"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { Event } from "lib/types"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import { BreadcrumbItem } from "lib/breadcrumbs"

type Props = {
  material: Material
  events: Event[]
  pageInfo: PageTemplate
}

const EventsPage: NextPage<Props> = ({ material, events, pageInfo }) => {
  const { data: session } = useSession()
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Events" }]

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Events: ${pageInfo.title}`} breadcrumbs={breadcrumbs}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <div className="flex items-center justify-between gap-3 p-3">
          <Title text="Events" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        </div>
        <Card>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Course Events</h2>
          {!session && (
            <p className="font-normal text-gray-700 dark:text-gray-400">
              <Button onClick={() => signIn()} size="xs" fill="currentColor" className="inline-block align-middle">
                Login
              </Button>
              &nbsp; to enrol on an upcoming course, to select an active course, or to view your current courses.
            </p>
          )}
          <EventsView material={material} events={events} collapseOlderEvents={false} />
        </Card>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  const material = await getMaterial()
  removeMarkdown(material, material)

  if (!process.env.DATABASE_URL) {
    return {
      props: {
        material: makeSerializable(material),
        events: [],
        pageInfo: makeSerializable(pageInfo),
      },
      revalidate: revalidateTimeout,
    }
  }

  const prisma = (await import("lib/prisma")).default
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      console.log("error", e)
      return []
    })

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      pageInfo: makeSerializable(pageInfo),
    },
    revalidate: revalidateTimeout,
  }
}

export default EventsPage
