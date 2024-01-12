import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { Data } from "pages/api/event"
import { Event } from "lib/types"

// GET /api/events
const eventsFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
const useEvents = (): {
  events: Event[] | undefined
  error: string
  isLoading: boolean
  mutate: (event: Event[]) => void
} => {
  const { data, isLoading, error, mutate } = useSWR(`${basePath}/api/event`, eventsFetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const events = data && "events" in data ? data.events : undefined
  const eventsMutate = (events: Event[]) => mutate({ events })
  return { events, error: errorString, isLoading, mutate: eventsMutate }
}

export default useEvents
