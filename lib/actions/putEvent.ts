import { basePath } from "lib/basePath"
import { Event } from "pages/api/event/[eventId]"
import { Data } from "pages/api/event/[eventId]"

// function that returns a promise that does a PUT request for this endpoint
export const putEvent = async (event: Event): Promise<Data> => {
  const apiPath = `${basePath}/api/event/${event.id}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}
