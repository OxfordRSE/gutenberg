import { basePath } from "lib/basePath"
import { Event } from "lib/types"

// POST /api/events
export const postEvent = async (data?: Event): Promise<Event> => {
  const apiPath = `${basePath}/api/event`
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(data),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("event" in data) return data.event
    })
}
