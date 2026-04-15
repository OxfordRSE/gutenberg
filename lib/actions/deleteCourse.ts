import { basePath } from "lib/basePath"
import { Data } from "pages/api/course/[courseId]"

export const deleteCourse = async (courseId: number): Promise<Data> => {
  const apiPath = `${basePath}/api/course/${courseId}`
  return fetch(apiPath, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json())
}
