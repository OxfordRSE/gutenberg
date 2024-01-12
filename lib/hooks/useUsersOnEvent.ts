import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { Data } from "pages/api/event/[eventId]/users"
import { UsersWithUserOnEvents } from "pages/api/event/[eventId]/users"

const usersFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

// hook to get all users
const useUsersOnEvent = (
  eventId: number | undefined
): { users: UsersWithUserOnEvents[] | undefined; error: string; isLoading: boolean; mutate: KeyedMutator<Data> } => {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? `${basePath}/api/event/${eventId}/users` : false,
    usersFetcher
  )
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const users = data && "users" in data ? data.users : undefined
  return { users, error: errorString, isLoading, mutate }
}

export default useUsersOnEvent
