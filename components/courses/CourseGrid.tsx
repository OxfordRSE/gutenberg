import CourseCard from "./CourseCard"
import type { Course } from "pages/api/course"

type Props = {
  courses: Course[]
}

const CourseGrid: React.FC<Props> = ({ courses }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export default CourseGrid
