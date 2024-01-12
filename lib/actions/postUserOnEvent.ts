import { basePath } from "lib/basePath"
import { Data } from "pages/api/userOnEvent/[eventId]"
import { Event } from "lib/types"

// function that returns a promise that does a POST request for this endpoint
const postUserOnEvent = async (event: Event): Promise<Data> => {
  const apiPath = `${basePath}/api/userOnEvent/${event.id}`
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}

export default postUserOnEvent
