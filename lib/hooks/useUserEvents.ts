import useSWR, { Fetcher, KeyedMutator } from "swr"
import { Data } from "pages/api/user/userEvents"

interface UserEventFetcherParams {
  url: string
  data: string
}

// @ts-ignore
const userEventFetcher: Fetcher<Data, string> = ({ url, data }: UserEventFetcherParams) =>
  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json())

const useUserEvents = (
  userEmail?: string | null | undefined
): { data: any; error: string; isLoading: boolean; mutate: KeyedMutator<Data> } => {
  const { data, isLoading, error, mutate } = useSWR(
    {
      url: `/api/user/userEvents/`,
      data: { userEmail },
    },
    // @ts-ignore
    userEventFetcher
  )

  const errorString = error ? error : data && "error" in data ? data.error : undefined
  return { data, error: errorString, isLoading, mutate }
}

export default useUserEvents
