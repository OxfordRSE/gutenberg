import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Badge, Button, Table } from "flowbite-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import Title from "components/ui/Title"
import StatCard from "components/ui/StatCard"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import { BreadcrumbItem } from "lib/breadcrumbs"
import {
  calculateEventStats,
  eventStatsInclude,
  summarizeEventStats,
  type EventStats,
  type EventStatsOverview,
} from "lib/eventStats"
import { formatCountWithPercent, formatPercent } from "lib/stats"

type EventStatsPageProps = {
  material: Material
  pageInfo: PageTemplate
  overview: EventStatsOverview
  eventStats: EventStats[]
}

const breadcrumbs: BreadcrumbItem[] = [{ label: "Events", href: "/events" }, { label: "Stats" }]

const EventStatsPage: NextPage<EventStatsPageProps> = ({ material, pageInfo, overview, eventStats }) => {
  const sortedEvents = [...eventStats].sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name))

  return (
    <Layout
      material={material}
      pageInfo={pageInfo}
      pageTitle={`Event stats: ${pageInfo.title}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <div className="flex items-center justify-between gap-3">
          <Title text="Event Stats" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
          <Link href="/events">
            <Button color="light">Back to events</Button>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Events" value={overview.totalEvents} dataCy="event-stats-total-events" />
          <StatCard label="Visible events" value={overview.visibleEvents} dataCy="event-stats-visible-events" />
          <StatCard label="Students" value={overview.totalStudents} dataCy="event-stats-total-students" />
          <StatCard
            label="Instructors"
            value={formatCountWithPercent(
              overview.totalInstructors,
              overview.totalStudents + overview.totalInstructors
            )}
            dataCy="event-stats-total-instructors"
          />
          <StatCard label="Requests" value={overview.totalRequests} dataCy="event-stats-total-requests" />
          <StatCard
            label="Avg students / event"
            value={overview.averageStudentsPerEvent === null ? "N/A" : overview.averageStudentsPerEvent.toFixed(1)}
            dataCy="event-stats-average-students"
          />
          <StatCard
            label="Average student progress"
            value={formatPercent(overview.averageProgressPercent)}
            dataCy="event-stats-average-progress"
          />
          <StatCard
            label="Most popular event"
            value={overview.mostPopularEvent?.name || "N/A"}
            helpText={overview.mostPopularEvent ? `${overview.mostPopularEvent.studentCount} students` : undefined}
            dataCy="event-stats-most-popular-event"
          />
        </div>

        <div className="mt-8">
          <Title text="By Event" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          <div className="mt-3 overflow-x-auto">
            <Table data-cy="event-stats-table">
              <Table.Head>
                <Table.HeadCell>Event</Table.HeadCell>
                <Table.HeadCell>Students</Table.HeadCell>
                <Table.HeadCell>Instructors</Table.HeadCell>
                <Table.HeadCell>Requests</Table.HeadCell>
                <Table.HeadCell>Groups</Table.HeadCell>
                <Table.HeadCell>Items</Table.HeadCell>
                <Table.HeadCell>Avg progress</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {sortedEvents.map((event) => (
                  <Table.Row key={event.eventId}>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      <Link href={`/event/${event.eventId}/stats`} className="hover:underline">
                        {event.name}
                      </Link>
                      {event.hidden && (
                        <Badge color="gray" className="ml-2 inline-flex">
                          Hidden
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>{event.studentCount}</Table.Cell>
                    <Table.Cell>{event.instructorCount}</Table.Cell>
                    <Table.Cell>{event.requestCount}</Table.Cell>
                    <Table.Cell>{event.groupCount}</Table.Cell>
                    <Table.Cell>{event.itemCount}</Table.Cell>
                    <Table.Cell>{formatPercent(event.averageProgressPercent)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const userEmail = session?.user?.email || undefined
  const currentUser = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
  if (!currentUser?.admin) {
    return {
      redirect: {
        destination: "/events",
        permanent: false,
      },
    }
  }

  const pageInfo = loadPageTemplate()
  const events = await prisma.event.findMany({
    include: eventStatsInclude,
    orderBy: { start: "desc" },
  })
  const eventStats = await calculateEventStats(events)
  const overview = summarizeEventStats(eventStats)
  const material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, overview, eventStats }),
  }
}

export default EventStatsPage
