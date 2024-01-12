import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { Data, CommentThread } from "pages/api/commentThread"

// GET /api/events
const fetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())
const useCommentThreads = (
  eventId?: number
): {
  commentThreads: CommentThread[] | undefined
  error: string
  isLoading: boolean
  mutate: (commentThreads: CommentThread[]) => void
} => {
  const apiPath = eventId ? `${basePath}/api/commentThread?eventId=${eventId}` : `${basePath}/api/commentThread`
  const { data, isLoading, error, mutate } = useSWR(apiPath, fetcher)
  const errorString = error ? error : data && "error" in data ? data.error : undefined
  const commentThreads = data && "commentThreads" in data ? data.commentThreads : undefined
  const commentsThreadsMutate = (commentThreads: CommentThread[]) => mutate({ commentThreads })
  return { commentThreads: commentThreads, error: errorString, isLoading, mutate: commentsThreadsMutate }
}

export default useCommentThreads
