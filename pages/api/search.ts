import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import { getEmbedding } from "lib/search/createVectors"
import { searchVector, SearchResult } from "lib/search/vectorDb"

export default async function searchHandler(req: NextApiRequest, res: NextApiResponse<SearchResult[]>) {
  // Require an authenticated session: each request triggers an outbound
  // embedding call, so an unauthenticated endpoint is a cost/DoS vector.
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json([])
    return
  }

  getEmbedding(req.body)
    .then((vectors) => {
      const embedding = vectors[0]?.embedding
      if (!embedding) {
        res.status(400).json([]) // no embedding produced
        return
      }

      searchVector(embedding)
        .then((response: SearchResult[]) => {
          if (response) {
            res.status(200).json(response)
          } else {
            res.status(404).json([])
          }
        })
        .catch((err) => {
          console.error(err)
          res.status(500).json([])
        })
    })
    .catch((err) => {
      console.error(err)
      res.status(500).json([])
    })
}
