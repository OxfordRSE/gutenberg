import { basePath } from "lib/basePath"
import { Data } from "pages/api/userOnEvent/[eventId]"
import { UserOnEvent } from "@prisma/client"
import { Event } from "lib/types"
import { data } from "cypress/types/jquery"

export const deleteUserOnEvent = async (userOnEvent: UserOnEvent): Promise<Event> => {
  const eventId = userOnEvent.eventId
  const apiPath = `${basePath}/api/userOnEvent/${eventId}`
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userOnEvent }),
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) throw data.error
      if ("userOnEvent" in data) return data.userOnEvent
    })
}

export default deleteUserOnEvent
