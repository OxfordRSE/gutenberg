import { basePath } from "lib/basePath"

// function that returns a promise that does a PUT request for this endpoint
export const putProblem = async (sectionId: string, problemTag: string, problem: Prisma.ProblemUpdateInput): Promise<Problem> => {
  const apiPath = `${basePath}/api/problems/${sectionId}/${problemTag}`
  const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: problem })
  };
  return fetch(apiPath, requestOptions)
      .then(response => response.json())
}