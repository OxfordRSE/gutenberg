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
import { calculateCourseStats, courseStatsInclude, type CourseStats } from "lib/courseStats"
import {
  emptyProgressBandCounts,
  getProgressBand,
  progressBandLabels,
  progressHistogramBandOrder,
} from "lib/progressBands"
import { formatCountWithPercent, formatDays, formatPercent } from "lib/stats"

type CourseStatsDetailPageProps = {
  material: Material
  pageInfo: PageTemplate
  courseStats: CourseStats
}

type SectionSortKey = "title" | "totalProblems" | "averageCompletionPercent"
type LearnerSortKey = "userName" | "status" | "startedAt" | "completionPercent" | "completedProblems"

const courseSectionTableColumns: Array<{ label: string; sortKey: SectionSortKey }> = [
  { label: "Section", sortKey: "title" },
  { label: "Problems", sortKey: "totalProblems" },
  { label: "Avg completion", sortKey: "averageCompletionPercent" },
]

const courseLearnerTableColumns: Array<{ label: string; sortKey: LearnerSortKey; className?: string }> = [
  { label: "User", sortKey: "userName", className: "px-2 py-2" },
  { label: "Status", sortKey: "status", className: "px-2 py-2" },
  { label: "Dates", sortKey: "startedAt", className: "px-2 py-2" },
  { label: "Progress", sortKey: "completionPercent", className: "px-2 py-2" },
  { label: "Problems", sortKey: "completedProblems", className: "px-2 py-2" },
]

function formatDate(value: Date | null): string {
  if (!value) return "—"

  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()

  return `${day}/${month}/${year}`
}

const CourseStatsDetailPage: NextPage<CourseStatsDetailPageProps> = ({ material, pageInfo, courseStats }) => {
  const {
    sortedRows: sortedSections,
    sortKey: sectionSortKey,
    sortDirection: sectionSortDirection,
    updateSort: updateSectionSort,
  } = useSortableRows<CourseStats["sections"][number], SectionSortKey>({
    rows: courseStats.sections,
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
  } = useSortableRows<CourseStats["learners"][number], LearnerSortKey>({
    rows: courseStats.learners,
    initialSortKey: null,
    initialDirection: "desc",
    getDefaultDirection: (key) => (key === "userName" || key === "status" ? "asc" : "desc"),
    compareMap: {
      userName: (left, right) => (left.userName || left.userEmail).localeCompare(right.userName || right.userEmail),
      status: (left, right) => left.status.localeCompare(right.status),
      startedAt: (left, right) => left.startedAt.getTime() - right.startedAt.getTime(),
      completionPercent: (left, right) => (left.completionPercent ?? -1) - (right.completionPercent ?? -1),
      completedProblems: (left, right) => left.completedProblems - right.completedProblems,
    },
    tieBreaker: (left, right) => left.userEmail.localeCompare(right.userEmail),
  })

  const histogramCounts = courseStats.learners.reduce((acc, learner) => {
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

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Courses", href: "/courses" },
    { label: "Stats", href: "/courses/stats" },
    { label: courseStats.name, href: `/courses/${courseStats.courseId}` },
    { label: "Stats" },
  ]

  return (
    <Layout
      material={material}
      pageInfo={pageInfo}
      pageTitle={`${courseStats.name} stats: ${pageInfo.title}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <div className="flex items-center justify-between gap-3">
          <Title text={`${courseStats.name} Stats`} className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
          <div className="flex items-center gap-2">
            <Link href={`/courses/${courseStats.courseId}`}>
              <Button color="light">View course</Button>
            </Link>
            <Link href="/courses/stats">
              <Button color="light">All course stats</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Learners" value={courseStats.totalLearners} dataCy="course-detail-stats-total-learners" />
          <StatCard label="In progress" value={courseStats.enrolledCount} dataCy="course-detail-stats-enrolled" />
          <StatCard
            label="Completed"
            value={formatCountWithPercent(courseStats.completedCount, courseStats.totalLearners)}
            dataCy="course-detail-stats-completed"
          />
          <StatCard
            label="Dropped"
            value={formatCountWithPercent(courseStats.droppedCount, courseStats.totalLearners)}
            dataCy="course-detail-stats-dropped"
          />
          <StatCard
            label="Completion rate"
            value={formatPercent(courseStats.completionRate)}
            dataCy="course-detail-stats-completion-rate"
          />
          <StatCard
            label="Average completion time"
            value={formatDays(courseStats.averageCompletionDays)}
            helpText={`Median ${formatDays(courseStats.medianCompletionDays)}`}
            dataCy="course-detail-stats-completion-days"
          />
          <StatCard
            label="Average progress"
            value={formatPercent(courseStats.averageProgressPercent)}
            dataCy="course-detail-stats-progress"
          />
          <StatCard
            label="Trackable problems"
            value={courseStats.trackableProblems}
            dataCy="course-detail-stats-trackable-problems"
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
              <Title text="Learners" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
              <SortableTable dataCy="course-learner-stats-table" className="text-sm">
                <Table.Head>
                  {courseLearnerTableColumns.map((column) => (
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
                      <Table.Cell className="px-2 py-2 text-xs leading-tight whitespace-nowrap">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Start:</span>{" "}
                          {formatDate(learner.startedAt)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Done:</span>{" "}
                          {formatDate(learner.completedAt)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 whitespace-nowrap">
                        {formatPercent(learner.completionPercent)}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 whitespace-nowrap">
                        {learner.totalProblems > 0 ? `${learner.completedProblems}/${learner.totalProblems}` : "N/A"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </SortableTable>
            </div>
          </div>

          <div className="xl:w-1/2">
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <SortableTable dataCy="course-section-stats-table">
              <Table.Head>
                {courseSectionTableColumns.map((column) => (
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
        destination: "/courses",
        permanent: false,
      },
    }
  }

  const courseId = parseInt(context?.params?.courseId as string, 10)
  const pageInfo = loadPageTemplate()
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: courseStatsInclude,
  })

  if (!course) return { notFound: true }

  const [courseStats] = await calculateCourseStats([course])
  const material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, courseStats }),
  }
}

export default CourseStatsDetailPage
