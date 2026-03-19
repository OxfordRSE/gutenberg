import useSWR, { Fetcher } from "swr"
import { basePath } from "lib/basePath"
import type { Data } from "pages/api/course/progress"

const progressFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

const useMyCourseProgress = (enabled: boolean) => {
  const { data, isLoading, error, mutate } = useSWR(enabled ? `${basePath}/api/course/progress` : undefined, progressFetcher)

  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const progressByCourseId = data && "progressByCourseId" in data ? data.progressByCourseId : {}

  return { progressByCourseId, isLoading, error: errorString, mutate }
}

export default useMyCourseProgress
