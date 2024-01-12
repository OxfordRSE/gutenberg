import { basePath } from "lib/basePath"
import { Problem } from "lib/types"
import { ProblemUpdate } from "lib/types"
import { ResponseData as Data } from "pages/api/problems/[sectionTag]/[problemTag]"

// function that returns a promise that does a PUT request for this endpoint
const putProblem = async (sectionId: string, problemTag: string, problem: ProblemUpdate): Promise<Data> => {
  const apiPath = `${basePath}/api/problems/${sectionId}/${problemTag}`
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem: problem }),
  }
  return fetch(apiPath, requestOptions).then((response) => response.json())
}

export default putProblem
