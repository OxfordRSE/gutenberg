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

const breadcrumbs: BreadcrumbItem[] = [{ label: "Courses", href: "/courses" }, { label: "Stats" }]

const CourseStatsPage: NextPage<CourseStatsPageProps> = ({ material, pageInfo, overview, courseStats }) => {
  const courseColumns: Column<CourseStats>[] = [
    { key: "name", label: "Course", sortable: true, getValue: (c) => c.name, render: (c) => (<><Link href={`/courses/${c.courseId}/stats`} className="hover:underline font-medium text-gray-900 dark:text-white">{c.name}</Link>{c.hidden && <Badge color="gray" className="ml-2 inline-flex">Hidden</Badge>}</>) },
    { key: "level", label: "Level", sortable: true, getValue: (c) => c.level || "", render: (c) => c.level || "N/A" },
    { key: "people", label: "People", sortable: true, getValue: (c) => c.totalLearners, render: (c) => c.totalLearners },
    { key: "inProgress", label: "In progress", sortable: true, getValue: (c) => c.enrolledCount, render: (c) => c.enrolledCount },
    { key: "completed", label: "Completed", sortable: true, getValue: (c) => c.completedCount, render: (c) => c.completedCount },
    { key: "dropped", label: "Dropped", sortable: true, getValue: (c) => c.droppedCount, render: (c) => c.droppedCount },
    { key: "completionRate", label: "Completion rate", sortable: true, getValue: (c) => c.completionRate, render: (c) => formatPercent(c.completionRate) },
    { key: "avgCompletion", label: "Avg completion", sortable: true, getValue: (c) => c.averageCompletionDays, render: (c) => formatDays(c.averageCompletionDays) },
    { key: "avgProgress", label: "Avg progress", sortable: true, getValue: (c) => c.averageProgressPercent, render: (c) => formatPercent(c.averageProgressPercent) },
  ]

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
          <SortableTable
            columns={courseColumns}
            data={courseStats}
            rowKey={(c) => String(c.courseId)}
            dataCy="course-stats-table"
            defaultSort={{ key: "people", direction: "desc" }}
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
