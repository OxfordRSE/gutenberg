import useSWR, { Fetcher } from "swr"
import { basePath } from "lib/basePath"
import type { Data } from "pages/api/course/[courseId]/progress"

const progressFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

const useCourseProgress = (courseId?: number) => {
  const { data, isLoading, error, mutate } = useSWR(
    courseId ? `${basePath}/api/course/${courseId}/progress` : undefined,
    progressFetcher
  )

  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const progress = data && "total" in data ? data : undefined

  return { progress, isLoading, error: errorString, mutate }
}

export default useCourseProgress
