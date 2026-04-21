import useSWR, { Fetcher } from "swr"
import { ResponseData } from "pages/api/problems/[sectionTag]/[problemTag]"
import { Problem } from "lib/types"
import { basePath } from "lib/basePath"
import { useSession } from "next-auth/react"

// hook that gets a problem
const problemFetcher: Fetcher<ResponseData, string> = (url) => fetch(url).then((r) => r.json())
const useProblem = (
  sectionId: string,
  problemTag: string
): { problem: Problem | undefined; error: string; isLoading: boolean; mutate: (problem: Problem) => void } => {
  const { status } = useSession()
  const { data, isLoading, error, mutate } = useSWR(
    status === "authenticated" ? `${basePath}/api/problems/${sectionId}/${problemTag}` : false,
    problemFetcher
  )
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const problem = data && "problem" in data ? data.problem : undefined
  const mutateProblem = (problem: Problem) => mutate({ problem })
  return { problem, error: errorString, isLoading, mutate: mutateProblem }
}

export default useProblem
