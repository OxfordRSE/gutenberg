import { basePath } from "lib/basePath"
import { Comment } from "pages/api/comment"

const postComment = async (commentThreadId: number): Promise<Comment> => {
  const apiPath = `${basePath}/api/comment`
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment: { threadId: commentThreadId } }),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("comment" in data) return data.comment
    })
}

export default postComment
