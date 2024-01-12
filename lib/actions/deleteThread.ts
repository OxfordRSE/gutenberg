import { basePath } from "lib/basePath"
import { CommentThread, CommentThreadPost } from "pages/api/commentThread"

const deleteCommentThread = async (id: number): Promise<CommentThread> => {
  const apiPath = `${basePath}/api/commentThread/${id}`
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("commentThread" in data) return data.commentThread
    })
}

export default deleteCommentThread
