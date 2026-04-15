import { Card } from "flowbite-react"
import CourseLevelBadge from "./CourseLevelBadge"
import Link from "next/link"
import type { Course } from "pages/api/course"
import { Button } from "flowbite-react"
import useCourseProgress from "lib/hooks/useCourseProgress"
import CourseProgressBar from "components/courses/CourseProgressBar"
import { HiArrowNarrowRight, HiShieldCheck } from "react-icons/hi"
import CourseActiveActions from "./CourseActiveActions"
import type { CourseProgress } from "lib/courseProgress"
import TagChip from "components/ui/TagChip"

type Props = {
  course: Course
  progress?: CourseProgress
}

const CourseCard: React.FC<Props> = ({ course, progress: providedProgress }) => {
  const languageCount = course.language?.length ?? 0
  const languageLabel = languageCount === 1 ? "Language:" : "Languages:"
  const enrolment = course.UserOnCourse?.[0]
  const isCompleted = enrolment?.status === "COMPLETED"
  const showProgress = enrolment?.status === "ENROLLED" || isCompleted
  const { progress: fetchedProgress } = useCourseProgress(providedProgress || !showProgress ? undefined : course.id)
  const progress = providedProgress ?? fetchedProgress
  const total = progress?.total ?? 0
  const completed = progress?.completed ?? 0
  const hasProgress = showProgress && total > 0
  const completedAt = enrolment?.completedAt ? new Date(enrolment.completedAt) : null
  const completedLabel = completedAt
    ? completedAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null

  return (
    <Card
      className={
        isCompleted
          ? "border-2 border-emerald-400 shadow-sm shadow-emerald-200/40 dark:border-emerald-500 dark:shadow-emerald-500/20"
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/courses/${course.id}`} className="hover:underline">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              {course.name || "Untitled"}
              {isCompleted && <HiShieldCheck className="h-5 w-5 text-emerald-500" />}
            </h2>
          </Link>
          {course.summary && (
            <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{course.summary}</p>
          )}
        </div>
        <CourseLevelBadge level={course.level} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {course.tags.length > 0 &&
          course.tags.map((tag) => {
            return <TagChip key={tag} tag={tag} />
          })}
        <div className="ml-auto flex items-center gap-2">
          <CourseActiveActions courseExternalId={course.externalId} status={enrolment?.status ?? null} />
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" color="info">
              View course
              <HiArrowNarrowRight className="ml-2 h-4 w-4 self-center" />
            </Button>
          </Link>
        </div>
      </div>
      {languageCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{languageLabel}</span>
          {(course.language ?? []).map((language) => {
            return <TagChip key={language} tag={language} />
          })}
        </div>
      )}
      {isCompleted && completedLabel ? (
        <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          Completed on {completedLabel}
        </div>
      ) : hasProgress ? (
        <CourseProgressBar completed={completed} total={total} className="mt-3" />
      ) : showProgress ? (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">No trackable problems</div>
      ) : null}
      {course.outcomes.length > 0 && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Outcomes:</span> {course.outcomes.join(", ")}
        </div>
      )}
    </Card>
  )
}

export default CourseCard
