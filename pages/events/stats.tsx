import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Badge, Button } from "flowbite-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import Title from "components/ui/Title"
import StatCard from "components/ui/StatCard"
import SortableTable, { Column } from "components/ui/SortableTable"
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
  const eventColumns: Column<EventStats>[] = [
    { key: "name", label: "Event", sortable: true, getValue: (e) => e.name, render: (e) => (<><Link href={`/event/${e.eventId}/stats`} className="hover:underline font-medium text-gray-900 dark:text-white">{e.name}</Link>{e.hidden && <Badge color="gray" className="ml-2 inline-flex">Hidden</Badge>}</>) },
    { key: "students", label: "Students", sortable: true, getValue: (e) => e.studentCount, render: (e) => e.studentCount },
    { key: "instructors", label: "Instructors", sortable: true, getValue: (e) => e.instructorCount, render: (e) => e.instructorCount },
    { key: "requests", label: "Requests", sortable: true, getValue: (e) => e.requestCount, render: (e) => e.requestCount },
    { key: "groups", label: "Groups", sortable: true, getValue: (e) => e.groupCount, render: (e) => e.groupCount },
    { key: "items", label: "Items", sortable: true, getValue: (e) => e.itemCount, render: (e) => e.itemCount },
    { key: "avgProgress", label: "Avg progress", sortable: true, getValue: (e) => e.averageProgressPercent, render: (e) => formatPercent(e.averageProgressPercent) },
  ]

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
          <SortableTable
            columns={eventColumns}
            data={eventStats}
            rowKey={(e) => String(e.eventId)}
            dataCy="event-stats-table"
            defaultSort={{ key: "students", direction: "desc" }}
          />
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
