import type { NextApiRequest, NextApiResponse } from 'next'
import { getEmbedding } from '../../lib/search/createVectors'
import { searchVector } from '../../lib/search/vectorDb';
 
type ResponseData = {
    url: string
}
 
export default function searchHandler(
        req: NextApiRequest,
        res: NextApiResponse<ResponseData>
    ) {
        getEmbedding(req.body).then((vector) => {
            searchVector(vector.data[0].embedding).then((response) => { 
                console.log(response)
                if (response[0]) {
                    res.status(200).json({ url: response[0].payload.url})
                } 
                else {
                    res.status(200).json({ url: "No URL found" })
                }
            })

        })
}