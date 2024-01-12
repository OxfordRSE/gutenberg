import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from "swr"
import { Data, EventGroup } from "pages/api/eventGroup/[eventGroupId]"
import { basePath } from "lib/basePath"

// hook that gets a event
const eventFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
const useEventGroup = (
  id: number | undefined
): { eventGroup: EventGroup | undefined; error: string; isLoading: boolean; mutate: (event: EventGroup) => void } => {
  const { data, isLoading, error, mutate } = useSWR(id ? `${basePath}/api/eventGroup/${id}` : undefined, eventFetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const eventGroup = data && "eventGroup" in data ? data.eventGroup : undefined
  const mutateEventGroup = (eventGroup: EventGroup) => mutate({ eventGroup })
  return { eventGroup, error: errorString, isLoading, mutate: mutateEventGroup }
}

export default useEventGroup
