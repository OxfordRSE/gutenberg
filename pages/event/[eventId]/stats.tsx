import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Button, Table } from "flowbite-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import PercentageMeter from "components/ui/PercentageMeter"
import ProgressDistribution from "components/ui/ProgressDistribution"
import Title from "components/ui/Title"
import StatCard from "components/ui/StatCard"
import SortableHeadCell from "components/ui/SortableHeadCell"
import SortableTable from "components/ui/SortableTable"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import { BreadcrumbItem } from "lib/breadcrumbs"
import useSortableRows from "lib/hooks/useSortableRows"
import { calculateEventStats, eventStatsInclude, type EventStats } from "lib/eventStats"
import {
  emptyProgressBandCounts,
  getProgressBand,
  progressBandLabels,
  progressHistogramBandOrder,
} from "lib/progressBands"
import { formatPercent, formatRatioWithPercent } from "lib/stats"

type EventStatsDetailPageProps = {
  material: Material
  pageInfo: PageTemplate
  eventStats: EventStats
}

type SectionSortKey = "title" | "totalProblems" | "averageCompletionPercent"
type LearnerSortKey = "userName" | "status" | "completedProblems"

const sectionTableColumns: Array<{ label: string; sortKey: SectionSortKey }> = [
  { label: "Section", sortKey: "title" },
  { label: "Problems", sortKey: "totalProblems" },
  { label: "Avg completion", sortKey: "averageCompletionPercent" },
]

const learnerTableColumns: Array<{ label: string; sortKey: LearnerSortKey; className?: string }> = [
  { label: "User", sortKey: "userName", className: "px-2 py-2" },
  { label: "Status", sortKey: "status", className: "px-2 py-2" },
  { label: "Solved", sortKey: "completedProblems", className: "px-2 py-2" },
]

const EventStatsDetailPage: NextPage<EventStatsDetailPageProps> = ({ material, pageInfo, eventStats }) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
    { label: "Stats", href: "/events/stats" },
    { label: eventStats.name, href: `/event/${eventStats.eventId}` },
    { label: "Stats" },
  ]

  const {
    sortedRows: sortedSections,
    sortKey: sectionSortKey,
    sortDirection: sectionSortDirection,
    updateSort: updateSectionSort,
  } = useSortableRows<EventStats["sectionStats"][number], SectionSortKey>({
    rows: eventStats.sectionStats,
    initialSortKey: null,
    initialDirection: "desc",
    getDefaultDirection: (key) => (key === "title" ? "asc" : "desc"),
    compareMap: {
      title: (left, right) => left.title.localeCompare(right.title),
      totalProblems: (left, right) => left.totalProblems - right.totalProblems,
      averageCompletionPercent: (left, right) =>
        (left.averageCompletionPercent ?? -1) - (right.averageCompletionPercent ?? -1),
    },
    tieBreaker: (left, right) => left.title.localeCompare(right.title),
  })

  const {
    sortedRows: sortedLearners,
    sortKey: learnerSortKey,
    sortDirection: learnerSortDirection,
    updateSort: updateLearnerSort,
  } = useSortableRows<EventStats["learnerStats"][number], LearnerSortKey>({
    rows: eventStats.learnerStats,
    initialSortKey: null,
    initialDirection: "desc",
    getDefaultDirection: (key) => (key === "userName" || key === "status" ? "asc" : "desc"),
    compareMap: {
      userName: (left, right) => (left.userName || left.userEmail).localeCompare(right.userName || right.userEmail),
      status: (left, right) => left.status.localeCompare(right.status),
      completedProblems: (left, right) => left.completedProblems - right.completedProblems,
    },
    tieBreaker: (left, right) => left.userEmail.localeCompare(right.userEmail),
  })

  const totalPossibleProblems = eventStats.studentCount * eventStats.trackableProblems
  const histogramCounts = eventStats.learnerStats.reduce((acc, learner) => {
    if (learner.status !== "STUDENT") return acc
    const band = getProgressBand(learner.completionPercent, learner.totalProblems)
    acc[band] += 1
    return acc
  }, emptyProgressBandCounts())
  const histogramBands = progressHistogramBandOrder.map((band) => ({
    band,
    label: progressBandLabels[band],
    count: histogramCounts[band],
  }))
  const noTrackableCount = histogramCounts.noTrackable
  const trackableLearnerCount = Math.max(
    histogramBands.reduce((sum, entry) => sum + entry.count, 0),
    1
  )

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
            label="Problems solved"
            value={eventStats.totalSolvedProblems}
            helpText={formatRatioWithPercent(eventStats.totalSolvedProblems, totalPossibleProblems)}
            dataCy="event-detail-stats-total-solved-problems"
          />
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
        </div>

        <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex flex-col gap-6 xl:w-1/2">
            <div>
              <Title text="Progress" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
              <ProgressDistribution
                entries={histogramBands}
                totalCount={trackableLearnerCount}
                noTrackableCount={noTrackableCount}
                noTrackableLabel={progressBandLabels.noTrackable}
              />
            </div>

            <div>
              <Title text="Users" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
              <SortableTable dataCy="event-learner-stats-table" className="text-sm">
                <Table.Head>
                  {learnerTableColumns.map((column) => (
                    <SortableHeadCell
                      key={column.sortKey}
                      label={column.label}
                      active={learnerSortKey === column.sortKey}
                      direction={learnerSortDirection}
                      onClick={() => updateLearnerSort(column.sortKey)}
                      className={column.className}
                    />
                  ))}
                </Table.Head>
                <Table.Body className="divide-y">
                  {sortedLearners.map((learner) => (
                    <Table.Row key={`${learner.userEmail}-${learner.status}`}>
                      <Table.Cell className="px-2 py-2">
                        <div className="font-medium leading-tight text-gray-900 dark:text-white">
                          {learner.userName || learner.userEmail}
                        </div>
                        <div className="text-xs leading-tight text-gray-500 dark:text-gray-400">
                          {learner.userEmail}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 whitespace-nowrap">{learner.status}</Table.Cell>
                      <Table.Cell className="px-2 py-2 whitespace-nowrap">
                        {formatRatioWithPercent(learner.completedProblems, learner.totalProblems)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </SortableTable>
            </div>
          </div>

          <div className="xl:w-1/2">
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <SortableTable dataCy="event-section-stats-table">
              <Table.Head>
                {sectionTableColumns.map((column) => (
                  <SortableHeadCell
                    key={column.sortKey}
                    label={column.label}
                    active={sectionSortKey === column.sortKey}
                    direction={sectionSortDirection}
                    onClick={() => updateSectionSort(column.sortKey)}
                  />
                ))}
              </Table.Head>
              <Table.Body className="divide-y">
                {sortedSections.map((section) => (
                  <Table.Row key={section.sectionRef}>
                    <Table.Cell>
                      {section.url ? (
                        <Link href={section.url} className="hover:underline">
                          {section.title}
                        </Link>
                      ) : (
                        section.title
                      )}
                    </Table.Cell>
                    <Table.Cell>{section.totalProblems}</Table.Cell>
                    <Table.Cell>
                      <PercentageMeter value={section.averageCompletionPercent} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </SortableTable>
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
