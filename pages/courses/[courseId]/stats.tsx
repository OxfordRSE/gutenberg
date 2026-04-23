import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { Button, Table } from "flowbite-react"
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
import { calculateCourseStats, courseStatsInclude, type CourseStats } from "lib/courseStats"
import { formatCountWithPercent, formatDays, formatPercent } from "lib/stats"

type CourseStatsDetailPageProps = {
  material: Material
  pageInfo: PageTemplate
  courseStats: CourseStats
}

function formatDate(value: Date | null): string {
  return value ? new Date(value).toLocaleDateString() : "—"
}

const progressBandLabels: Record<keyof CourseStats["progressBands"], string> = {
  noTrackable: "No trackable problems",
  notStarted: "0%",
  oneToTwentyFive: "1-25%",
  twentySixToFifty: "26-50%",
  fiftyOneToSeventyFive: "51-75%",
  seventySixToNinetyNine: "76-99%",
  complete: "100%",
}

const CourseStatsDetailPage: NextPage<CourseStatsDetailPageProps> = ({ material, pageInfo, courseStats }) => {
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

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <Title text="Progress Bands" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3 overflow-x-auto">
              <Table data-cy="course-progress-bands-table">
                <Table.Head>
                  <Table.HeadCell>Band</Table.HeadCell>
                  <Table.HeadCell>Learners</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {Object.entries(courseStats.progressBands).map(([band, count]) => (
                    <Table.Row key={band}>
                      <Table.Cell>{progressBandLabels[band as keyof CourseStats["progressBands"]]}</Table.Cell>
                      <Table.Cell>{count}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>

          <div>
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3 overflow-x-auto">
              <Table data-cy="course-section-stats-table">
                <Table.Head>
                  <Table.HeadCell>Section</Table.HeadCell>
                  <Table.HeadCell>Problems</Table.HeadCell>
                  <Table.HeadCell>Avg completion</Table.HeadCell>
                  <Table.HeadCell>Fully complete</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {courseStats.sections.map((section) => (
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
                      <Table.Cell>{formatPercent(section.averageCompletionPercent)}</Table.Cell>
                      <Table.Cell>{section.fullyCompletedLearners}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Title text="Learners" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          <div className="mt-3 overflow-x-auto">
            <Table data-cy="course-learner-stats-table" className="text-sm">
              <Table.Head>
                <Table.HeadCell className="px-2 py-2">User</Table.HeadCell>
                <Table.HeadCell className="px-2 py-2">Status</Table.HeadCell>
                <Table.HeadCell className="px-2 py-2">Dates</Table.HeadCell>
                <Table.HeadCell className="px-2 py-2">Progress</Table.HeadCell>
                <Table.HeadCell className="px-2 py-2">Problems</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {courseStats.learners.map((learner) => (
                  <Table.Row key={`${learner.userEmail}-${learner.status}`}>
                    <Table.Cell className="px-2 py-2">
                      <div className="font-medium leading-tight text-gray-900 dark:text-white">
                        {learner.userName || learner.userEmail}
                      </div>
                      <div className="text-xs leading-tight text-gray-500 dark:text-gray-400">{learner.userEmail}</div>
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
