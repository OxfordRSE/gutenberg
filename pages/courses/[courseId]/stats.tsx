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
  const totalProblemsSolved = courseStats.learners.reduce((sum, l) => sum + l.completedProblems, 0)
  const totalProblemsAvailable = courseStats.learners.reduce((sum, l) => sum + l.totalProblems, 0)

  const sectionColumns: Column<(typeof courseStats.sections)[number]>[] = [
    { key: "title", label: "Section", sortable: true, getValue: (s) => s.title, render: (s) => s.url ? <Link href={s.url} className="hover:underline">{s.title}</Link> : s.title },
    { key: "problems", label: "Problems", sortable: true, getValue: (s) => s.totalProblems, render: (s) => s.totalProblems },
    { key: "avgCompletion", label: "Avg completion", sortable: true, getValue: (s) => s.averageCompletionPercent, render: (s) => formatPercent(s.averageCompletionPercent) },
    { key: "fullyComplete", label: "Fully complete", sortable: true, getValue: (s) => s.fullyCompletedLearners, render: (s) => s.fullyCompletedLearners },
  ]

  const learnerColumns: Column<(typeof courseStats.learners)[number]>[] = [
    { key: "user", label: "User", sortable: true, getValue: (l) => l.userName || l.userEmail, cellClassName: "px-2 py-2", headCellClassName: "px-2 py-2", render: (l) => (<><div className="font-medium leading-tight text-gray-900 dark:text-white">{l.userName || l.userEmail}</div><div className="text-xs leading-tight text-gray-500 dark:text-gray-400">{l.userEmail}</div></>) },
    { key: "status", label: "Status", sortable: true, getValue: (l) => l.status, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => l.status },
    { key: "dates", label: "Dates", sortable: true, getValue: (l) => l.startedAt ? new Date(l.startedAt).getTime() : 0, cellClassName: "px-2 py-2 text-xs leading-tight whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => (<><div><span className="font-medium text-gray-700 dark:text-gray-300">Start:</span> {formatDate(l.startedAt)}</div><div><span className="font-medium text-gray-700 dark:text-gray-300">Done:</span> {formatDate(l.completedAt)}</div></>) },
    { key: "progress", label: "Progress", sortable: true, getValue: (l) => l.completionPercent, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => formatPercent(l.completionPercent) },
    { key: "problems", label: "Problems", sortable: true, getValue: (l) => l.completedProblems, cellClassName: "px-2 py-2 whitespace-nowrap", headCellClassName: "px-2 py-2", render: (l) => l.totalProblems > 0 ? `${l.completedProblems}/${l.totalProblems}` : "N/A" },
  ]
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
          <StatCard
            label="Total problems solved"
            value={`${totalProblemsSolved}/${totalProblemsAvailable}`}
            dataCy="course-detail-stats-total-solved"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <Title text="Progress Bands" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3 overflow-x-auto">
              <SortableTable
                columns={[
                  { key: "band", label: "Band", sortable: false, getValue: (b) => b.label, render: (b) => b.label },
                  { key: "count", label: "Learners", sortable: true, getValue: (b) => b.count, render: (b) => b.count },
                ]}
                data={Object.entries(courseStats.progressBands).map(([band, count]) => ({ band, label: progressBandLabels[band as keyof CourseStats["progressBands"]], count }))}
                rowKey={(b) => b.band}
                dataCy="course-progress-bands-table"
                wrapperClassName="overflow-x-auto"
              />
            </div>
          </div>

          <div>
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <SortableTable
              columns={sectionColumns}
              data={courseStats.sections}
              rowKey={(s) => s.sectionRef}
              dataCy="course-section-stats-table"
              wrapperClassName="mt-3 max-h-[600px] overflow-y-auto overflow-x-auto"
            />
          </div>
        </div>

        <div className="mt-8">
          <Title text="Learners" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          <SortableTable
            columns={learnerColumns}
            data={courseStats.learners}
            rowKey={(l) => `${l.userEmail}-${l.status}`}
            dataCy="course-learner-stats-table"
            tableClassName="text-sm"
            defaultSort={{ key: "progress", direction: "desc" }}
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
