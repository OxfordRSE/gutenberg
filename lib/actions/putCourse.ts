import { basePath } from "lib/basePath"
import { Prisma } from "@prisma/client"
import { Data } from "pages/api/course/[courseId]"

export type CourseUpdatePayload = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
  }
}>

export const putCourse = async (course: CourseUpdatePayload): Promise<Data> => {
  const apiPath = `${basePath}/api/course/${course.id}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course }),
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}
