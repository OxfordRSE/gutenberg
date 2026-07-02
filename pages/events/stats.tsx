import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Badge, Button, Table } from "flowbite-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import PercentageMeter from "components/ui/PercentageMeter"
import Title from "components/ui/Title"
import StatCard from "components/ui/StatCard"
import SortableHeadCell from "components/ui/SortableHeadCell"
import SortableTable from "components/ui/SortableTable"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import { BreadcrumbItem } from "lib/breadcrumbs"
import useSortableRows from "lib/hooks/useSortableRows"
import {
  calculateEventStats,
  eventStatsInclude,
  summarizeEventStats,
  type EventStats,
  type EventStatsOverview,
} from "lib/eventStats"
import { formatCountWithPercent, formatPercent, formatRatioWithPercent } from "lib/stats"

type EventStatsPageProps = {
  material: Material
  pageInfo: PageTemplate
  overview: EventStatsOverview
  eventStats: EventStats[]
}

const breadcrumbs: BreadcrumbItem[] = [{ label: "Events", href: "/events" }, { label: "Stats" }]

type EventSortKey =
  | "name"
  | "studentCount"
  | "instructorCount"
  | "requestCount"
  | "groupCount"
  | "itemCount"
  | "averageProgressPercent"
  | "totalSolvedProblems"

const eventTableColumns: Array<{ label: string; sortKey: EventSortKey }> = [
  { label: "Event", sortKey: "name" },
  { label: "Students", sortKey: "studentCount" },
  { label: "Instructors", sortKey: "instructorCount" },
  { label: "Requests", sortKey: "requestCount" },
  { label: "Groups", sortKey: "groupCount" },
  { label: "Items", sortKey: "itemCount" },
  { label: "Avg progress", sortKey: "averageProgressPercent" },
  { label: "Solved", sortKey: "totalSolvedProblems" },
]

const EventStatsPage: NextPage<EventStatsPageProps> = ({ material, pageInfo, overview, eventStats }) => {
  const {
    sortedRows: sortedEvents,
    sortKey,
    sortDirection,
    updateSort,
  } = useSortableRows<EventStats, EventSortKey>({
    rows: eventStats,
    initialSortKey: "studentCount",
    initialDirection: "desc",
    getDefaultDirection: (key) => (key === "name" ? "asc" : "desc"),
    compareMap: {
      name: (left, right) => left.name.localeCompare(right.name),
      studentCount: (left, right) => left.studentCount - right.studentCount,
      instructorCount: (left, right) => left.instructorCount - right.instructorCount,
      requestCount: (left, right) => left.requestCount - right.requestCount,
      groupCount: (left, right) => left.groupCount - right.groupCount,
      itemCount: (left, right) => left.itemCount - right.itemCount,
      averageProgressPercent: (left, right) =>
        (left.averageProgressPercent ?? -1) - (right.averageProgressPercent ?? -1),
      totalSolvedProblems: (left, right) => left.totalSolvedProblems - right.totalSolvedProblems,
    },
    tieBreaker: (left, right) => left.name.localeCompare(right.name),
  })

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
            label="Problems solved"
            value={overview.totalSolvedProblems}
            dataCy="event-stats-total-solved-problems"
          />
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
          <SortableTable dataCy="event-stats-table">
            <Table.Head>
              {eventTableColumns.map((column) => (
                <SortableHeadCell
                  key={column.sortKey}
                  label={column.label}
                  active={sortKey === column.sortKey}
                  direction={sortDirection}
                  onClick={() => updateSort(column.sortKey)}
                />
              ))}
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
                  <Table.Cell>
                    <PercentageMeter value={event.averageProgressPercent} />
                  </Table.Cell>
                  <Table.Cell>
                    {formatRatioWithPercent(event.totalSolvedProblems, event.studentCount * event.trackableProblems)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </SortableTable>
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
