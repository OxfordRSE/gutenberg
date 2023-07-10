import { basePath } from "lib/basePath"
import { CommentThread } from "pages/api/commentThread"

// POST /api/events
const postCommentThread = async (eventId: number): Promise<CommentThread> => {
  const apiPath = `${basePath}/api/commentThread`
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentThread: { eventId } }),
  };
  return fetch(apiPath, requestOptions).then(response => response.json()).then(data => {
    if ('error' in data) throw data.error
    if ('commentThread' in data) return data.commentThread
  })
}

export default postCommentThread;