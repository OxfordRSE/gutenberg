import Link from "next/link"
import { Badge } from "flowbite-react"
import { HiShieldCheck } from "react-icons/hi"
import { getTagColor } from "lib/tagColors"
import { formatTagLabel } from "lib/tagLabels"
import type { Course } from "pages/api/course"
import useCourseProgress from "lib/hooks/useCourseProgress"
import CourseProgressBar from "components/courses/CourseProgressBar"

type Props = {
  course: Course
}

const HomeCourseListItem: React.FC<Props> = ({ course }) => {
  const enrolment = course.UserOnCourse?.[0]
  const isCompleted = enrolment?.status === "COMPLETED"
  const isEnrolled = enrolment?.status === "ENROLLED"
  const showProgress = isCompleted || isEnrolled
  const { progress } = useCourseProgress(showProgress ? course.id : undefined)
  const total = progress?.total ?? 0
  const completed = progress?.completed ?? 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : isCompleted ? 100 : 0
  const displayLanguages = (course.language ?? []).slice(0, 2)
  const displayTags = (course.tags ?? []).slice(0, 3)

  return (
    <li
      className={`rounded-lg border p-4 ${
        isCompleted
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
                const color = getTagColor(language)
                return (
                  <Badge key={language} style={{ backgroundColor: color.background, color: color.text }}>
                    {formatTagLabel(language)}
                  </Badge>
                )
              })}
              {isCompleted && <HiShieldCheck className="h-5 w-5 flex-none text-emerald-500" />}
            </h3>
          </Link>
          {displayTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayTags.map((tag) => {
                const color = getTagColor(tag)
                return (
                  <Badge key={tag} style={{ backgroundColor: color.background, color: color.text }}>
                    {formatTagLabel(tag)}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
        {showProgress && total > 0 && (
          <div className="w-24 flex-none">
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">{percent}%</div>
            <CourseProgressBar completed={completed} total={total} hideLabelRow className="mt-1" />
          </div>
        )}
      </div>
    </li>
  )
}

export default HomeCourseListItem
