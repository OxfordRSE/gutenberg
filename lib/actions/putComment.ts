import { basePath } from "lib/basePath"
import { Data, Comment } from 'pages/api/comment/[commentId]'

// function that returns a promise that does a PUT request for this endpoint
export const putComment = async (comment: Comment): Promise<Data> => {
  const apiPath = `${basePath}/api/comment/${comment.id}`
  const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
  };
  return fetch(apiPath, requestOptions)
      .then(response => response.json())
}