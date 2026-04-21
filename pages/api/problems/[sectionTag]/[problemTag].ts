import type { NextApiRequest, NextApiResponse } from "next"
import type { Problem } from "lib/types"
import prisma from "lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"

export type ResponseData = {
  problem?: Problem
  error?: string
}

const Problem = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { method } = req
  const problemTag = req.query.problemTag
  const sectionTag = req.query.sectionTag
  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email

  if (!problemTag) {
    res.status(400).json({ error: "No problem tag" })
    return
  }

  if (!sectionTag) {
    res.status(400).json({ error: "No section tag" })
    return
  }

  if (!userEmail) {
    res.status(401).json({ error: "Not logged in" })
    return
  }

  if (typeof problemTag !== "string") {
    res.status(400).json({ error: "Problem tag is not a string" })
    return
  }

  if (typeof sectionTag !== "string") {
    res.status(400).json({ error: "Section tag is not a string" })
    return
  }

  switch (method) {
    case "GET":
      const problem = await prisma.problem.findUnique({
        where: {
          userEmail_tag_section: {
            userEmail,
            tag: problemTag,
            section: sectionTag,
          },
        },
      })
      res.status(200).json(problem ? { problem } : {})
      break
    case "PUT":
      if (!("problem" in req.body)) {
        res.status(400).json({ error: "No problem in body" })
        return
      }

      const updatedProblem = await prisma.problem.upsert({
        where: {
          userEmail_tag_section: {
            userEmail,
            tag: problemTag,
            section: sectionTag,
          },
        },
        update: { ...req.body.problem },
        create: { ...req.body.problem, userEmail: userEmail, tag: problemTag, section: sectionTag },
      })
      res.status(200).json({ problem: updatedProblem })
      break
    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}

export default Problem
