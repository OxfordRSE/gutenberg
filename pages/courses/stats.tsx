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
  calculateCourseStats,
  courseStatsInclude,
  summarizeCourseStats,
  type CourseStatsOverview,
  type CourseStats,
} from "lib/courseStats"
import { formatCountWithPercent, formatDays, formatPercent } from "lib/stats"

type CourseStatsPageProps = {
  material: Material
  pageInfo: PageTemplate
  overview: CourseStatsOverview
  courseStats: CourseStats[]
}

type CourseSortKey =
  | "name"
  | "level"
  | "totalLearners"
  | "enrolledCount"
  | "completedCount"
  | "droppedCount"
  | "completionRate"
  | "averageCompletionDays"
  | "averageProgressPercent"

const courseTableColumns: Array<{ label: string; sortKey: CourseSortKey }> = [
  { label: "Course", sortKey: "name" },
  { label: "Level", sortKey: "level" },
  { label: "People", sortKey: "totalLearners" },
  { label: "In progress", sortKey: "enrolledCount" },
  { label: "Completed", sortKey: "completedCount" },
  { label: "Dropped", sortKey: "droppedCount" },
  { label: "Completion rate", sortKey: "completionRate" },
  { label: "Avg completion", sortKey: "averageCompletionDays" },
  { label: "Avg progress", sortKey: "averageProgressPercent" },
]

const breadcrumbs: BreadcrumbItem[] = [{ label: "Courses", href: "/courses" }, { label: "Stats" }]

const CourseStatsPage: NextPage<CourseStatsPageProps> = ({ material, pageInfo, overview, courseStats }) => {
  const {
    sortedRows: sortedCourses,
    sortKey,
    sortDirection,
    updateSort,
  } = useSortableRows<CourseStats, CourseSortKey>({
    rows: courseStats,
    initialSortKey: "totalLearners",
    initialDirection: "desc",
    getDefaultDirection: (key) => (key === "name" || key === "level" ? "asc" : "desc"),
    compareMap: {
      name: (left, right) => left.name.localeCompare(right.name),
      level: (left, right) => (left.level || "").localeCompare(right.level || ""),
      totalLearners: (left, right) => left.totalLearners - right.totalLearners,
      enrolledCount: (left, right) => left.enrolledCount - right.enrolledCount,
      completedCount: (left, right) => left.completedCount - right.completedCount,
      droppedCount: (left, right) => left.droppedCount - right.droppedCount,
      completionRate: (left, right) => (left.completionRate ?? -1) - (right.completionRate ?? -1),
      averageCompletionDays: (left, right) => (left.averageCompletionDays ?? -1) - (right.averageCompletionDays ?? -1),
      averageProgressPercent: (left, right) =>
        (left.averageProgressPercent ?? -1) - (right.averageProgressPercent ?? -1),
    },
    tieBreaker: (left, right) => left.name.localeCompare(right.name),
  })

  return (
    <Layout
      material={material}
      pageInfo={pageInfo}
      pageTitle={`Course stats: ${pageInfo.title}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <div className="flex items-center justify-between gap-3">
          <Title text="Course Stats" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
          <Link href="/courses">
            <Button color="light">Back to courses</Button>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Courses" value={overview.totalCourses} dataCy="course-stats-total-courses" />
          <StatCard label="People on courses" value={overview.totalLearners} dataCy="course-stats-total-learners" />
          <StatCard label="In progress" value={overview.totalEnrolled} dataCy="course-stats-total-enrolled" />
          <StatCard
            label="Completed"
            value={formatCountWithPercent(overview.totalCompleted, overview.totalLearners)}
            dataCy="course-stats-total-completed"
          />
          <StatCard
            label="Dropped"
            value={formatCountWithPercent(overview.totalDropped, overview.totalLearners)}
            dataCy="course-stats-total-dropped"
          />
          <StatCard
            label="Completion rate"
            value={formatPercent(overview.overallCompletionRate)}
            dataCy="course-stats-overall-completion-rate"
          />
          <StatCard
            label="Average completion time"
            value={formatDays(overview.averageCompletionDays)}
            dataCy="course-stats-average-completion-days"
          />
          <StatCard
            label="Average progress"
            value={formatPercent(overview.averageProgressPercent)}
            helpText={`${overview.trackableCourses} courses with trackable problems`}
            dataCy="course-stats-average-progress"
          />
          <StatCard
            label="Most popular course"
            value={overview.mostPopularCourse?.name || "N/A"}
            helpText={overview.mostPopularCourse ? `${overview.mostPopularCourse.totalPeople} people` : undefined}
            dataCy="course-stats-most-popular-course"
          />
        </div>

        <div className="mt-8">
          <Title text="By Course" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          <SortableTable dataCy="course-stats-table">
            <Table.Head>
              {courseTableColumns.map((column) => (
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
              {sortedCourses.map((course) => (
                <Table.Row key={course.courseId}>
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    <Link href={`/courses/${course.courseId}/stats`} className="hover:underline">
                      {course.name}
                    </Link>
                    {course.hidden && (
                      <Badge color="gray" className="ml-2 inline-flex">
                        Hidden
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>{course.level || "N/A"}</Table.Cell>
                  <Table.Cell>{course.totalLearners}</Table.Cell>
                  <Table.Cell>{course.enrolledCount}</Table.Cell>
                  <Table.Cell>{course.completedCount}</Table.Cell>
                  <Table.Cell>{course.droppedCount}</Table.Cell>
                  <Table.Cell>{formatPercent(course.completionRate)}</Table.Cell>
                  <Table.Cell>{formatDays(course.averageCompletionDays)}</Table.Cell>
                  <Table.Cell>
                    <PercentageMeter value={course.averageProgressPercent} />
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
        destination: "/courses",
        permanent: false,
      },
    }
  }

  const pageInfo = loadPageTemplate()
  const courses = await prisma.course.findMany({
    include: courseStatsInclude,
    orderBy: { name: "asc" },
  })
  const courseStats = await calculateCourseStats(courses)
  const overview = summarizeCourseStats(courseStats)
  const material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo, overview, courseStats }),
  }
}

export default CourseStatsPage
