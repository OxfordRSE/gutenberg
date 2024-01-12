import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from "swr"
import { Data, Event } from "pages/api/event/[eventId]"
import { basePath } from "lib/basePath"

// hook that gets a event
const eventFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
const useEvent = (
  id: number | undefined
): { event: Event | undefined; error: string; isLoading: boolean; mutate: (event: Event) => void } => {
  const { data, isLoading, error, mutate } = useSWR(id ? `${basePath}/api/event/${id}` : undefined, eventFetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const event = data && "event" in data ? data.event : undefined
  const mutateEvent = (event: Event) => mutate({ event })
  return { event, error: errorString, isLoading, mutate: mutateEvent }
}

export default useEvent
