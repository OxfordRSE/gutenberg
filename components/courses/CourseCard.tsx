import { Card, Badge } from "flowbite-react"
import { Prisma } from "@prisma/client"
import CourseLevelBadge from "./CourseLevelBadge"
import Link from "next/link"
import { getTagColor } from "lib/tagColors"

type Course = Prisma.CourseGetPayload<{}>

type Props = {
  course: Course
}

const CourseCard: React.FC<Props> = ({ course }) => {
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
      {course.languages.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {course.languages.map((language) => {
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
          <span className="font-semibold text-gray-800 dark:text-gray-200">Outcomes:</span>{" "}
          {course.outcomes.join(", ")}
        </div>
      )}
    </Card>
  )
}

export default CourseCard
