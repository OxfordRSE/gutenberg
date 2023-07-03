import useSWR, { Fetcher, KeyedMutator } from 'swr'
import { basePath } from 'lib/basePath'

const usersFetcher: Fetcher<GetData, string> = url => fetch(url).then(r => r.json())

// hook to get all users
const useUsers = (): { users: User[] | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<GetData> } => {
  const { data, error, isLoading, mutate} = useSWR(`${basePath}/api/user`, usersFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const users = data && 'users' in data ? data.users : undefined;
  return { users, error: errorString, isLoading, mutate}
}

export default useUsers;