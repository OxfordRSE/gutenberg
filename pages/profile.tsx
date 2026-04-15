import type { NextPage, GetStaticProps } from "next"
import Image from "next/image"
import useSWR, { Fetcher } from "swr"
import { Card } from "flowbite-react"
import { signIn, useSession } from "next-auth/react"
import { CourseStatus, Problem } from "@prisma/client"
import Layout from "components/Layout"
import HomeCourseListItem from "components/home/HomeCourseListItem"
import ProfileEventView from "components/event/ProfileEventView"
import Title from "components/ui/Title"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import useProfile from "lib/hooks/useProfile"
import useUserEvents from "lib/hooks/useUserEvents"
import useMyCourseProgress from "lib/hooks/useMyCourseProgress"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import { basePath } from "lib/basePath"
import { partitionCoursesForListPage } from "lib/courseSections"
import type { Course, Data as CoursesData } from "pages/api/course"
import type { EventFull as Event, UserOnEvent } from "lib/types"
import Link from "next/link"

type ProfileProps = {
  material: Material
  pageInfo: PageTemplate
}

const coursesFetcher: Fetcher<CoursesData, string> = (url) => fetch(url).then((r) => r.json())

const Profile: NextPage<ProfileProps> = ({ material, pageInfo }) => {
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile()
  const { data: coursesData, isLoading: coursesLoading } = useSWR(
    session ? `${basePath}/api/course` : null,
    coursesFetcher
  )
  const eventsWithProblems = useUserEvents(userProfile?.email || "")

  const allCourses = coursesData?.courses ?? []
  const { myCourses } = partitionCoursesForListPage(allCourses)
  const { progressByCourseId } = useMyCourseProgress(!!userProfile && myCourses.length > 0)
  const currentCourses = myCourses.filter((course) => course.UserOnCourse?.[0]?.status !== CourseStatus.COMPLETED)
  const completedCourses = myCourses.filter((course) => course.UserOnCourse?.[0]?.status === CourseStatus.COMPLETED)

  let userEvents: Event[] = []
  let userProblems: Problem[] = []
  let userOnEvents: UserOnEvent[] = []

  if (eventsWithProblems.data !== undefined) {
    if ("userEvents" in eventsWithProblems.data) {
      userEvents = eventsWithProblems.data.userEvents
    }
    if ("problems" in eventsWithProblems.data) {
      userProblems = eventsWithProblems.data.problems
    }
    if ("userOnEvents" in eventsWithProblems.data) {
      userOnEvents = eventsWithProblems.data.userOnEvents
    }
  }

  if (profileError) return <div>{profileError}</div>
  if (profileLoading) return <div>loading...</div>
  if (!session) {
    return (
      <Layout material={material} pageInfo={pageInfo} pageTitle={`Profile: ${pageInfo.title}`}>
        <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
          <Card className="max-w-xl">
            <div className="space-y-3">
              <Title text="Profile" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
              <p className="text-gray-700 dark:text-gray-300">You need to sign in to view your profile.</p>
              <div>
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                >
                  Sign in
                </button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Profile: ${pageInfo.title}`}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <Title text="Profile" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <Image
                width={56}
                height={56}
                className="rounded-full"
                src={userProfile?.image ?? "avatar"}
                alt="User Avatar"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{userProfile?.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To delete your account, please email{" "}
            <a href="mailto:martin.robinson@dtc.ox.ac.uk" className="text-blue-700 hover:underline dark:text-blue-400">
              martin.robinson@dtc.ox.ac.uk
            </a>
            .
          </p>
        </Card>

        <div className="mb-8">
          <Title text="Your Courses" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          {coursesLoading ? (
            <Card className="mt-3">
              <p className="text-gray-700 dark:text-gray-300">Loading your courses…</p>
            </Card>
          ) : currentCourses.length > 0 ? (
            <ul className="mt-3 space-y-3" data-cy="profile-courses">
              {currentCourses.map((course: Course) => (
                <HomeCourseListItem key={course.id} course={course} progress={progressByCourseId?.[course.id]} />
              ))}
            </ul>
          ) : (
            <Card className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-gray-700 dark:text-gray-300">You have not started any courses yet.</p>
                <Link href="/courses">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                  >
                    Browse courses
                  </button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {completedCourses.length > 0 && (
          <div className="mb-8">
            <Title text="Completed Courses" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <ul className="mt-3 space-y-3" data-cy="profile-completed-courses">
              {completedCourses.map((course: Course) => (
                <HomeCourseListItem key={course.id} course={course} progress={progressByCourseId?.[course.id]} />
              ))}
            </ul>
          </div>
        )}

        <div className="mb-8">
          <Title text="Your Events" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
          {eventsWithProblems.isLoading ? (
            <Card className="mt-3">
              <p className="text-gray-700 dark:text-gray-300">Loading your events…</p>
            </Card>
          ) : userEvents.length > 0 ? (
            <div className="mt-3 space-y-4" data-cy="profile-events">
              {userEvents.map((event) => (
                <ProfileEventView
                  key={event.id}
                  event={event}
                  material={material}
                  userProblems={userProblems}
                  userOnEvent={userOnEvents.find((userOnEvent) => userOnEvent.eventId === event.id) as UserOnEvent}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-3">
              <p className="text-gray-700 dark:text-gray-300">You are not currently enrolled on any events.</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const material = await getMaterial()
  const pageInfo = loadPageTemplate()

  removeMarkdown(material, undefined)

  return {
    props: makeSerializable({ material, pageInfo }),
  }
}

export default Profile
