import Link from "next/link"
import useSWR, { Fetcher } from "swr"
import { CourseStatus } from "@prisma/client"
import { Card } from "flowbite-react"
import { basePath } from "lib/basePath"
import type { CourseBySection, Data } from "pages/api/course/by-section"
import useLearningContext from "lib/hooks/useLearningContext"
import CourseActiveActions from "./CourseActiveActions"

const courseHintFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

type ContentProps = {
  courses: CourseBySection[]
}

const enrolledStatuses = new Set<CourseStatus>([CourseStatus.ENROLLED, CourseStatus.COMPLETED])

export const MaterialCourseHintContent: React.FC<ContentProps> = ({ courses }) => {
  const [learningContext] = useLearningContext()

  if (courses.length === 0) return null

  const enrolledCourses = courses.filter((course) => enrolledStatuses.has(course.UserOnCourse?.[0]?.status as CourseStatus))
  const activeCourse =
    learningContext?.type === "course" ? courses.find((course) => course.externalId === learningContext.externalId) : undefined

  const primaryCourse = activeCourse ?? enrolledCourses[0] ?? courses[0]
  const primaryStatus = primaryCourse.UserOnCourse?.[0]?.status ?? null

  let message = "This section is part of a course."
  if (activeCourse) {
    message = "This section is part of your active course on:"
  } else if (enrolledCourses.length === 1) {
    message = "This section is part of your course on:"
  } else if (enrolledCourses.length > 1) {
    message = `This section is part of ${enrolledCourses.length} of your courses.`
  } else if (courses.length > 1) {
    message = `This section is part of ${courses.length} courses.`
  } else {
    message = "This section is part of the course:"
  }

  const showPrimaryActions = !!primaryCourse && (activeCourse || enrolledCourses.length === 1)

  return (
    <Card className="mb-6 border border-cyan-200 bg-cyan-50/60 shadow-sm dark:border-cyan-900 dark:bg-cyan-950/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-cyan-900 dark:text-cyan-100">{message}</p>
          {(showPrimaryActions || courses.length === 1) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link href={`/courses/${primaryCourse.id}`} className="font-semibold text-cyan-900 hover:underline dark:text-cyan-100">
                {primaryCourse.name}
              </Link>
              {showPrimaryActions && (
                <CourseActiveActions
                  courseExternalId={primaryCourse.externalId}
                  status={primaryStatus}
                  verbose={false}
                  size="xs"
                />
              )}
            </div>
          )}
        </div>
        {courses.length > 1 && (
          <Link href="/courses" className="text-sm font-medium text-cyan-800 hover:underline dark:text-cyan-200">
            Browse courses
          </Link>
        )}
      </div>
    </Card>
  )
}

type Props = {
  pageLabel: string
}

const MaterialCourseHint: React.FC<Props> = ({ pageLabel }) => {
  const { data } = useSWR(`${basePath}/api/course/by-section?section=${encodeURIComponent(pageLabel)}`, courseHintFetcher)
  const courses = data?.courses ?? []

  if (!courses.length) return null

  return <MaterialCourseHintContent courses={courses} />
}

export default MaterialCourseHint
