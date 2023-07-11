import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"
import { Data, CommentThread } from "pages/api/commentThread"


// GET /api/events
const fetcher: Fetcher<Data, string> = url => fetch(url).then(r => r.json())
const useCommentThread= (id: number): { commentThread: CommentThread | undefined, error: string, isLoading: boolean, mutate: (commentThread: CommentThread) => void } => {
  const apiPath = `${basePath}/api/commentThread/${id}`
  const { data, isLoading, error, mutate } = useSWR(apiPath, fetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const commentThread = data && 'commentThread' in data ? data.commentThread: undefined;
  const commentsThreadMutate = (commentThread: CommentThread) => mutate({ commentThread })
  return { commentThread, error: errorString, isLoading, mutate: commentsThreadMutate }
}

export default useCommentThread;