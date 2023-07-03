import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from 'swr'
import { ResponseData } from 'pages/problems/[sectionTag]/[problemTag]'

// hook that gets a problem
const problemFetcher: Fetcher<ResponseData, string> = url => fetch(url).then(r => r.json())
export const useProblem = (sectionId: string, problemTag: string): { problem: Problem | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<ResponseData> } => {
  const { data, isLoading, error, mutate } = useSWR(`${basePath}/api/problems/${sectionId}/${problemTag}`, problemFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const problem = data && 'problem' in data ? data.problem : undefined;
  return { problem, error: errorString, isLoading, mutate}
}