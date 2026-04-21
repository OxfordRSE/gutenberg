import Link from "next/link"
import { Button } from "flowbite-react"
import { HiArrowNarrowRight, HiShieldCheck } from "react-icons/hi"
import type { Course } from "pages/api/course"
import useCourseProgress from "lib/hooks/useCourseProgress"
import CourseProgressBar from "components/courses/CourseProgressBar"
import type { CourseProgress } from "lib/courseProgress"
import useActiveCourse from "lib/hooks/useActiveCourse"
import CourseActiveActions from "components/courses/CourseActiveActions"
import TagChip from "components/ui/TagChip"

type Props = {
  course: Course
  progress?: CourseProgress
  showStartButton?: boolean
}

const HomeCourseListItem: React.FC<Props> = ({ course, progress: providedProgress, showStartButton = false }) => {
  const enrolment = course.UserOnCourse?.[0]
  const isCompleted = enrolment?.status === "COMPLETED"
  const isEnrolled = enrolment?.status === "ENROLLED"
  const showProgress = isCompleted || isEnrolled
  const { progress: fetchedProgress } = useCourseProgress(providedProgress || !showProgress ? undefined : course.id)
  const progress = providedProgress ?? fetchedProgress
  const total = progress?.total ?? 0
  const completed = progress?.completed ?? 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : isCompleted ? 100 : 0
  const displayLanguages = (course.language ?? []).slice(0, 2)
  const [activeCourseExternalId] = useActiveCourse()
  const isActiveCourse = activeCourseExternalId === course.externalId
  const displayTags = (course.tags ?? []).slice(0, 3)

  return (
    <li
      className={`rounded-lg border p-4 ${
        isActiveCourse
          ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-700 dark:bg-cyan-950/20"
          : isCompleted
            ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/30"
            : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/courses/${course.id}`} className="hover:underline">
            <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <span className="truncate">{course.name}</span>
              {displayLanguages.map((language) => {
                return <TagChip key={language} tag={language} />
              })}
              {isCompleted && <HiShieldCheck className="h-5 w-5 flex-none text-emerald-500" />}
            </h3>
          </Link>
          {displayTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayTags.map((tag) => {
                return <TagChip key={tag} tag={tag} />
              })}
            </div>
          )}
        </div>
        <div className="flex flex-none flex-col items-end gap-2">
          {showStartButton && (
            <Link href={`/courses/${course.id}`}>
              <Button color="info" size="xs" className="[&>span]:items-center">
                Start
                <HiArrowNarrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          )}
          <CourseActiveActions courseExternalId={course.externalId} status={enrolment?.status ?? null} size="xs" />
          {showProgress && total > 0 && (
            <div className="w-24 flex-none">
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">{percent}%</div>
              <CourseProgressBar completed={completed} total={total} hideLabelRow className="mt-1" />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default HomeCourseListItem
