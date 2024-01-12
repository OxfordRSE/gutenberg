import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from "swr"
import { Data } from "pages/api/event/[eventId]/problems"
import { basePath } from "lib/basePath"
import { Problem } from "lib/types"

// hook that gets problems for an event
const problemsFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
export const useProblems = (
  eventId: number | undefined
): { problems: Problem[] | undefined; error: string; isLoading: boolean; mutate: KeyedMutator<Data> } => {
  const { data, isLoading, error, mutate } = useSWR(
    eventId ? `${basePath}/api/event/${eventId}/problems` : false,
    problemsFetcher
  )
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const problems = data && "problems" in data ? data.problems : undefined
  return { problems, error: errorString, isLoading, mutate }
}
