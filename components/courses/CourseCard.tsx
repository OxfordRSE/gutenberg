import { Card, Badge } from "flowbite-react"
import CourseLevelBadge from "./CourseLevelBadge"
import Link from "next/link"
import { getTagColor } from "lib/tagColors"
import type { Course } from "pages/api/course"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { basePath } from "lib/basePath"
import CourseEnrolment from "./CourseEnrolment"

type Props = {
  course: Course
}

const CourseCard: React.FC<Props> = ({ course }) => {
  const languageCount = course.language?.length ?? 0
  const languageLabel = languageCount === 1 ? "Language:" : "Languages:"
  const { data: session } = useSession()
  const initialUserOnCourse = course.UserOnCourse?.[0] ?? null
  const [userOnCourse, setUserOnCourse] = useState(initialUserOnCourse)
  const [isUpdating, setIsUpdating] = useState(false)
  useEffect(() => {
    setUserOnCourse(course.UserOnCourse?.[0] ?? null)
  }, [course.UserOnCourse])

  const handleEnrol = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`${basePath}/api/course/${course.id}/enrol`, { method: "POST" })
      const data = await res.json()
      if ("userOnCourse" in data) {
        setUserOnCourse(data.userOnCourse)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnenrol = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`${basePath}/api/course/${course.id}/unenrol`, { method: "POST" })
      const data = await res.json()
      if ("userOnCourse" in data) {
        setUserOnCourse(data.userOnCourse)
      }
    } finally {
      setIsUpdating(false)
    }
  }

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
      <CourseEnrolment
        status={userOnCourse?.status ?? null}
        isLoggedIn={!!session}
        isUpdating={isUpdating}
        onEnrol={handleEnrol}
        onUnenrol={handleUnenrol}
        size="xs"
        className="mt-2"
      />
      {course.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {course.tags.map((tag) => {
            const color = getTagColor(tag)
            return (
              <Badge key={tag} style={{ backgroundColor: color.background, color: color.text }}>
                {tag}
              </Badge>
            )
          })}
        </div>
      )}
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
      {course.outcomes.length > 0 && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Outcomes:</span> {course.outcomes.join(", ")}
        </div>
      )}
    </Card>
  )
}

export default CourseCard
