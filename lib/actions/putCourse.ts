import { basePath } from "lib/basePath"
import { CourseFull, Data } from "pages/api/course/[courseId]"

export const putCourse = async (course: CourseFull): Promise<Data> => {
  const apiPath = `${basePath}/api/course/${course.id}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course }),
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}
