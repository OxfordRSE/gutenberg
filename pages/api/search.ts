import type { NextApiRequest, NextApiResponse } from "next"
import { getEmbedding } from "lib/search/createVectors"
import { searchVector, SearchResult } from "lib/search/vectorDb"

export default function searchHandler(req: NextApiRequest, res: NextApiResponse<SearchResult[]>) {
  getEmbedding(req.body).then(async (vector) => {
    searchVector(vector.data[0].embedding).then((response: SearchResult[]) => {
      if (response) {
        res.status(200).json(response)
      } else {
        res.status(404)
      }
    })
  })
}
