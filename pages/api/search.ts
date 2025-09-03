import type { NextApiRequest, NextApiResponse } from "next"
import { getEmbedding } from "lib/search/createVectors"
import { searchVector, SearchResult } from "lib/search/vectorDb"

export default function searchHandler(req: NextApiRequest, res: NextApiResponse<SearchResult[]>) {
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
