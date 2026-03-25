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
  const sortedCourses = [...courseStats].sort(
    (a, b) => b.totalLearners - a.totalLearners || a.name.localeCompare(b.name)
  )

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
          <div className="mt-3 overflow-x-auto">
            <Table data-cy="course-stats-table">
              <Table.Head>
                <Table.HeadCell>Course</Table.HeadCell>
                <Table.HeadCell>Level</Table.HeadCell>
                <Table.HeadCell>People</Table.HeadCell>
                <Table.HeadCell>In progress</Table.HeadCell>
                <Table.HeadCell>Completed</Table.HeadCell>
                <Table.HeadCell>Dropped</Table.HeadCell>
                <Table.HeadCell>Completion rate</Table.HeadCell>
                <Table.HeadCell>Avg completion</Table.HeadCell>
                <Table.HeadCell>Avg progress</Table.HeadCell>
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
                    <Table.Cell>{formatPercent(course.averageProgressPercent)}</Table.Cell>
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
