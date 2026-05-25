import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Button } from "flowbite-react"
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
import { calculateEventStats, eventStatsInclude, type EventStats } from "lib/eventStats"
import { formatPercent } from "lib/stats"

type EventStatsDetailPageProps = {
  material: Material
  pageInfo: PageTemplate
  eventStats: EventStats
}

const EventStatsDetailPage: NextPage<EventStatsDetailPageProps> = ({ material, pageInfo, eventStats }) => {
  const totalProblemsSolved = eventStats.learnerStats.reduce((sum, l) => sum + l.completedProblems, 0)
  const totalProblemsAvailable = eventStats.learnerStats.reduce((sum, l) => sum + l.totalProblems, 0)

  const sectionColumns: Column<(typeof eventStats.sectionStats)[number]>[] = [
    { key: "title", label: "Section", sortable: true, getValue: (s) => s.title, render: (s) => s.url ? <Link href={s.url} className="hover:underline">{s.title}</Link> : s.title },
    { key: "problems", label: "Problems", sortable: true, getValue: (s) => s.totalProblems, render: (s) => s.totalProblems },
    { key: "avgCompletion", label: "Avg completion", sortable: true, getValue: (s) => s.averageCompletionPercent, render: (s) => formatPercent(s.averageCompletionPercent) },
    { key: "fullyComplete", label: "Fully complete", sortable: true, getValue: (s) => s.fullyCompletedLearners, render: (s) => s.fullyCompletedLearners },
  ]

  const learnerColumns: Column<(typeof eventStats.learnerStats)[number]>[] = [
    { key: "user", label: "User", sortable: true, getValue: (l) => l.userName || l.userEmail, cellClassName: "px-2 py-2", headCellClassName: "px-2 py-2", render: (l) => (<><div className="font-medium leading-tight text-gray-900 dark:text-white">{l.userName || l.userEmail}</div><div className="text-xs leading-tight text-gray-500 dark:text-gray-400">{l.userEmail}</div></>) },
    { key: "status", label: "Status", sortable: true, getValue: (l) => l.status, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => l.status },
    { key: "progress", label: "Progress", sortable: true, getValue: (l) => l.completionPercent, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => formatPercent(l.completionPercent) },
    { key: "problems", label: "Problems", sortable: true, getValue: (l) => l.completedProblems, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => l.totalProblems > 0 ? `${l.completedProblems}/${l.totalProblems}` : "N/A" },
  ]
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
    { label: "Stats", href: "/events/stats" },
    { label: eventStats.name, href: `/event/${eventStats.eventId}` },
    { label: "Stats" },
  ]

  return (
    <Layout
      material={material}
      pageInfo={pageInfo}
      pageTitle={`${eventStats.name} stats: ${pageInfo.title}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <div className="flex items-center justify-between gap-3">
          <Title text={`${eventStats.name} Stats`} className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
          <div className="flex items-center gap-2">
            <Link href={`/event/${eventStats.eventId}`}>
              <Button color="light">View event</Button>
            </Link>
            <Link href="/events/stats">
              <Button color="light">All event stats</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={eventStats.studentCount} dataCy="event-detail-stats-students" />
          <StatCard label="Instructors" value={eventStats.instructorCount} dataCy="event-detail-stats-instructors" />
          <StatCard label="Requests" value={eventStats.requestCount} dataCy="event-detail-stats-requests" />
          <StatCard label="Rejected" value={eventStats.rejectedCount} dataCy="event-detail-stats-rejected" />
          <StatCard label="Groups" value={eventStats.groupCount} dataCy="event-detail-stats-groups" />
          <StatCard label="Items" value={eventStats.itemCount} dataCy="event-detail-stats-items" />
          <StatCard
            label="Average student progress"
            value={formatPercent(eventStats.averageProgressPercent)}
            dataCy="event-detail-stats-progress"
          />
          <StatCard
            label="Trackable problems"
            value={eventStats.trackableProblems}
            dataCy="event-detail-stats-trackable-problems"
          />
          <StatCard
            label="Total problems solved"
            value={`${totalProblemsSolved}/${totalProblemsAvailable}`}
            dataCy="event-detail-stats-total-solved"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <SortableTable
              columns={sectionColumns}
              data={eventStats.sectionStats}
              rowKey={(s) => s.sectionRef}
              dataCy="event-section-stats-table"
              wrapperClassName="mt-3 max-h-[600px] overflow-y-auto overflow-x-auto"
            />
          </div>

          <div>
            <Title text="Users" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <SortableTable
              columns={learnerColumns}
              data={eventStats.learnerStats}
              rowKey={(l) => `${l.userEmail}-${l.status}`}
              dataCy="event-learner-stats-table"
              tableClassName="text-sm"
              defaultSort={{ key: "progress", direction: "desc" }}
            />
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

  const eventId = parseInt(context?.params?.eventId as string, 10)
  const pageInfo = loadPageTemplate()
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: eventStatsInclude,
  })

  if (!event) return { notFound: true }

  const [eventStats] = await calculateEventStats([event])
  const material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, eventStats }),
  }
}

export default EventStatsDetailPage
