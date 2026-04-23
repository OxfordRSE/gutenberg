import { basePath } from "lib/basePath"
import { Event } from "pages/api/event/[eventId]"

export type EventCreatePayload =
  | Partial<Event>
  | {
      sourceCourseId?: number
      startAt?: string
    }

// POST /api/events
export const postEvent = async (data?: EventCreatePayload): Promise<Event> => {
  const apiPath = `${basePath}/api/event`
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("event" in data) return data.event
    })
}
