import { basePath } from "lib/basePath"
import { Data } from "pages/api/userOnEvent/[eventId]"
import { UserOnEvent } from "@prisma/client"
import { Event } from "lib/types"
import { data } from "cypress/types/jquery"

export const putUserOnEvent = async (eventId: number, userOnEvent: UserOnEvent): Promise<Event> => {
  const apiPath = `${basePath}/api/userOnEvent/${eventId}`
  const requestOptions = {
    method: "PUT",
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

export default putUserOnEvent
