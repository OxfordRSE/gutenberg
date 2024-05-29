import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = "https://plausible.io/api/event"

  // Forward the request to Plausible's API
  const plausibleRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": req.headers["user-agent"] || "",
    },
    body: JSON.stringify(req.body),
  })

  // Send the response back to the client
  if (plausibleRes.ok) {
    const content = await plausibleRes.json()
    res.status(200).json(content)
  } else {
    res.status(plausibleRes.status).json({ message: "Failed to proxy to Plausible" })
  }
}
