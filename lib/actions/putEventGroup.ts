import { basePath } from "lib/basePath"
import { EventGroup } from "pages/api/eventGroup/[eventGroupId]"
import { Data } from "pages/api/eventGroup/[eventGroupId]"

// function that returns a promise that does a PUT request for this endpoint
export const putEventGroup = async (eventGroup: EventGroup): Promise<Data> => {
  const apiPath = `${basePath}/api/eventGroup/${eventGroup.id}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventGroup }),
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}
