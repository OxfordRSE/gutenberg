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
import { calculateEventStats, eventStatsInclude, type EventStats } from "lib/eventStats"
import { formatPercent } from "lib/stats"

type EventStatsDetailPageProps = {
  material: Material
  pageInfo: PageTemplate
  eventStats: EventStats
}

const EventStatsDetailPage: NextPage<EventStatsDetailPageProps> = ({ material, pageInfo, eventStats }) => {
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
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <Title text="Sections" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3 overflow-x-auto">
              <Table data-cy="event-section-stats-table">
                <Table.Head>
                  <Table.HeadCell>Section</Table.HeadCell>
                  <Table.HeadCell>Problems</Table.HeadCell>
                  <Table.HeadCell>Avg completion</Table.HeadCell>
                  <Table.HeadCell>Fully complete</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {eventStats.sectionStats.map((section) => (
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

          <div>
            <Title text="Users" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3 overflow-x-auto">
              <Table data-cy="event-learner-stats-table" className="text-sm">
                <Table.Head>
                  <Table.HeadCell className="px-2 py-2">User</Table.HeadCell>
                  <Table.HeadCell className="px-2 py-2">Status</Table.HeadCell>
                  <Table.HeadCell className="px-2 py-2">Progress</Table.HeadCell>
                  <Table.HeadCell className="px-2 py-2">Problems</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {eventStats.learnerStats.map((learner) => (
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
