import { basePath } from "lib/basePath"
import { Event } from "pages/api/event/[eventId]"
import { Data } from "pages/api/event/[eventId]"

// function that returns a promise that does a DELETE request for this endpoint
export const deleteEvent = async (event: Event): Promise<Data> => {
  const apiPath = `${basePath}/api/event/${event.id}`
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("event" in data) return data.event
    })
}
