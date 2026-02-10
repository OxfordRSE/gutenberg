import { Card, Badge } from "flowbite-react"
import CourseLevelBadge from "./CourseLevelBadge"
import Link from "next/link"
import { getTagColor } from "lib/tagColors"
import type { Course } from "pages/api/course"
import { Button } from "flowbite-react"
import useCourseProgress from "lib/hooks/useCourseProgress"
import CourseProgressBar from "components/courses/CourseProgressBar"

type Props = {
  course: Course
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const languageCount = course.language?.length ?? 0
  const languageLabel = languageCount === 1 ? "Language:" : "Languages:"
  const enrolment = course.UserOnCourse?.[0]
  const showProgress = enrolment?.status === "ENROLLED" || enrolment?.status === "COMPLETED"
  const { progress } = useCourseProgress(showProgress ? course.id : undefined)
  const total = progress?.total ?? 0
  const completed = progress?.completed ?? 0
  const hasProgress = showProgress && total > 0

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/courses/${course.id}`} className="hover:underline">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{course.name || "Untitled"}</h2>
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
            const color = getTagColor(tag)
            return (
              <Badge key={tag} style={{ backgroundColor: color.background, color: color.text }}>
                {tag}
              </Badge>
            )
          })}
        <div className="ml-auto">
          <Link href={`/courses/${course.id}`}>
            <Button size="xs" color="info">
              View course
            </Button>
          </Link>
        </div>
      </div>
      {languageCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{languageLabel}</span>
          {(course.language ?? []).map((language) => {
            const color = getTagColor(language)
            return (
              <Badge key={language} style={{ backgroundColor: color.background, color: color.text }}>
                {language}
              </Badge>
            )
          })}
        </div>
      )}
      {hasProgress ? (
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
