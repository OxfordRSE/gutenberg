import { useMemo } from "react"
import Link from "next/link"
import { Button, Card } from "flowbite-react"
import { useSession } from "next-auth/react"
import useSWR, { Fetcher } from "swr"
import { CourseStatus } from "@prisma/client"
import { basePath } from "lib/basePath"
import type { Course, Data as CoursesData } from "pages/api/course"
import { sortCourses } from "lib/courseSort"
import HomeCourseListItem from "./HomeCourseListItem"
import useMyCourseProgress from "lib/hooks/useMyCourseProgress"

type Props = {
  initialCourses: Course[]
}

const coursesFetcher: Fetcher<CoursesData, string> = (url) => fetch(url).then((r) => r.json())

const HomeCoursesPanel: React.FC<Props> = ({ initialCourses }) => {
  const { data: session } = useSession()
  const { data, isLoading } = useSWR(`${basePath}/api/course`, coursesFetcher, {
    fallbackData: { courses: initialCourses },
  })

  const courses = sortCourses(data?.courses ?? [])
  const visibleCourses = courses.filter((course) => !course.hidden)
  const previewCourses = visibleCourses.filter((course) => course.UserOnCourse?.[0]?.status !== CourseStatus.DROPPED)

  const myCourses = useMemo(() => {
    return previewCourses
      .filter((course) => {
        const status = course.UserOnCourse?.[0]?.status
        return status && status !== CourseStatus.DROPPED
      })
      .sort((a, b) => {
        const aCompleted = a.UserOnCourse?.[0]?.status === CourseStatus.COMPLETED
        const bCompleted = b.UserOnCourse?.[0]?.status === CourseStatus.COMPLETED
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1
        return 0
      })
  }, [previewCourses])

  const otherCourses = useMemo(() => {
    return previewCourses.filter((course) => !myCourses.some((mine) => mine.id === course.id))
  }, [myCourses, previewCourses])

  const displayedMyCourses = myCourses.slice(0, 2)
  const displayedOtherCourses = otherCourses.slice(0, Math.max(0, 4 - displayedMyCourses.length))
  const shouldLoadProgress = !!session && displayedMyCourses.length > 0
  const { progressByCourseId } = useMyCourseProgress(shouldLoadProgress)

  const heading = session ? "Courses" : "Self-paced Courses"
  const hasMyCourses = displayedMyCourses.length > 0

  return (
    <Card>
      <div className="flex h-full flex-col gap-4 p-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{heading}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Self-paced courses to guide you through our training material.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Loading courses...
          </div>
        ) : previewCourses.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            No courses are available yet.
          </div>
        ) : (
          <div className="space-y-5">
            {hasMyCourses && (
              <section>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Continue where you left off</h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {displayedMyCourses.map((course) => (
                    <HomeCourseListItem key={course.id} course={course} progress={progressByCourseId[course.id]} />
                  ))}
                </ul>
              </section>
            )}

            {displayedOtherCourses.length > 0 && (
              <section className={hasMyCourses ? "border-t border-gray-200 pt-5 dark:border-gray-700" : ""}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {hasMyCourses ? "Start a new course" : "Browse a few courses"}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {displayedOtherCourses.map((course) => (
                    <HomeCourseListItem key={course.id} course={course} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div className="mt-2 flex gap-3">
          <Link href="/courses">
            <Button color="info">Browse all {previewCourses.length} courses</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default HomeCoursesPanel
