import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from "swr"
import { ResponseData } from "pages/api/problems/[sectionTag]/[problemTag]"
import { Problem } from "lib/types"
import { basePath } from "lib/basePath"

// hook that gets a problem
const problemFetcher: Fetcher<ResponseData, string> = (url) => fetch(url).then((r) => r.json())
const useProblem = (
  sectionId: string,
  problemTag: string
): { problem: Problem | undefined; error: string; isLoading: boolean; mutate: (problem: Problem) => void } => {
  const { data, isLoading, error, mutate } = useSWR(
    `${basePath}/api/problems/${sectionId}/${problemTag}`,
    problemFetcher
  )
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const problem = data && "problem" in data ? data.problem : undefined
  const mutateProblem = (problem: Problem) => mutate({ problem })
  return { problem, error: errorString, isLoading, mutate: mutateProblem }
}

export default useProblem
