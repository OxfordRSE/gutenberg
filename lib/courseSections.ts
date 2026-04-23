import { CourseStatus } from "@prisma/client"
import type { Course } from "pages/api/course"

export const partitionCoursesForListPage = (courses: Course[]) => {
  const visibleCourses = courses.filter((course) => !course.hidden)
  const hiddenCourses = courses.filter((course) => course.hidden)
  const myCourses = visibleCourses.filter((course) => {
    const status = course.UserOnCourse?.[0]?.status
    return status && status !== CourseStatus.DROPPED
  })
  const otherCourses = visibleCourses.filter((course) => {
    const status = course.UserOnCourse?.[0]?.status
    return !status || status === CourseStatus.DROPPED
  })

  return { visibleCourses, hiddenCourses, myCourses, otherCourses }
}
