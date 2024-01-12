import { basePath } from "lib/basePath"

// GET /api/search
const searchQuery = async (query: string) => {
  const apiPath = `${basePath}/api/search/`
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "text/html" },
    body: query,
  }
  return fetch(apiPath, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      return data
    })
}

export default searchQuery
