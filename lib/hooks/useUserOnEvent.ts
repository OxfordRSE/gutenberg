import useSWR, { Fetcher, KeyedMutator } from "swr"
import { Data } from "pages/api/userOnEvent/[eventId]"
import { UserOnEvent } from "@prisma/client"
import { basePath } from "lib/basePath"

// hook that gets the userOnEvent for this event
const eventFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
export const useUserOnEvent = (
  eventId: number
): { userOnEvent: UserOnEvent | undefined; error: string; isLoading: boolean; mutate: KeyedMutator<Data> } => {
  const { data, isLoading, error, mutate } = useSWR(`${basePath}/api/userOnEvent/${eventId}`, eventFetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const userOnEvent = data && "userOnEvent" in data ? data.userOnEvent : undefined
  return { userOnEvent, error: errorString, isLoading, mutate }
}
