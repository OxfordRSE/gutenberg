import CourseCard from "./CourseCard"
import type { Course } from "pages/api/course"
import type { CourseProgress } from "lib/courseProgress"

type Props = {
  courses: Course[]
  progressByCourseId?: Record<number, CourseProgress>
}

const CourseGrid: React.FC<Props> = ({ courses, progressByCourseId }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} progress={progressByCourseId?.[course.id]} />
      ))}
    </div>
  )
}

export default CourseGrid
