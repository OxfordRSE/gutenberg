import type { NextApiRequest, NextApiResponse } from 'next'
import { getEmbedding } from 'lib/search/createVectors'
import { searchVector, SearchResult } from 'lib/search/vectorDb';

 
export default function searchHandler(
        req: NextApiRequest,
        res: NextApiResponse<SearchResult[]>
    ) {
        console.log('request received', req.body)
        getEmbedding(req.body).then(async (vector) => {
            searchVector(vector.data[0].embedding).then((response: SearchResult[]) => { 
                console.log(response)
                if (response) {
                    res.status(200).json(response)
                }
                else {
                    res.status(404)
                }
            })
        })
}