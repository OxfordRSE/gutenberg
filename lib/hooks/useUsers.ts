import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { GetData } from "pages/api/user"
import { User } from "@prisma/client"

const usersFetcher: Fetcher<GetData, string> = (url) => fetch(url).then((r) => r.json())

// hook to get all users
const useUsers = (): {
  users: User[] | undefined
  error: string
  isLoading: boolean
  mutate: (users: User[]) => void
} => {
  const { data, error, isLoading, mutate } = useSWR(`${basePath}/api/user`, usersFetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const users = data && "users" in data ? data.users : undefined
  const mutateUsers = (users: User[]) => mutate({ users })
  return { users, error: errorString, isLoading, mutate: mutateUsers }
}

export default useUsers
