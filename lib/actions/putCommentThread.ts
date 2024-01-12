import { basePath } from "lib/basePath"
import { Data, CommentThread } from "pages/api/commentThread/[commentThreadId]"

const putCommentThread = async (commentThread: CommentThread): Promise<CommentThread> => {
  const apiPath = `${basePath}/api/commentThread/${commentThread.id}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentThread }),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("commentThread" in data) return data.commentThread
    })
}

export default putCommentThread
