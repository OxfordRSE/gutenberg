import { Data } from '/pages/api/eventFull'
import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"

const myEventsFetcher: Fetcher<Data, string> = url => fetch(url).then(r => r.json())

// hook that gets my events
export const useMyEvents = (): { events: EventFull[] | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<Data> } => {
  const { data, error, isLoading, mutate } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const events = data && 'events' in data ? data.events : undefined;
  return { events, error: errorString, isLoading, mutate}
}