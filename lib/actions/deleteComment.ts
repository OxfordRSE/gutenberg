import { basePath } from "lib/basePath"
import { Comment } from "pages/api/comment"

const deleteComment = async (id: number): Promise<Comment> => {
  const apiPath = `${basePath}/api/comment/${id}`
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("comment" in data) return data.comment
    })
}

export default deleteComment
