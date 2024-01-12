import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { Data, User, UserPublic } from "pages/api/user/[email]"

const fetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
const useUser = (
  email?: string
): { user: User | UserPublic | undefined; error: string; isLoading: boolean; mutate: (user: User) => void } => {
  const apiPath = () => (email ? `${basePath}/api/user/${email}` : false)
  const { data, isLoading, error, mutate } = useSWR(apiPath, fetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const user = data && "user" in data ? data.user : undefined
  const userMutate = (user: User) => mutate({ user })
  return { user, error: errorString, isLoading, mutate: userMutate }
}

export default useUser
