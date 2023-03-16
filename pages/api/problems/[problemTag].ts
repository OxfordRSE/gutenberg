import type { NextApiRequest, NextApiResponse } from 'next'
import { Problem } from "lib/types"
import prisma from 'lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export type ResponseData = {
  problem: Problem | string;
}

const Problem = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { method } = req;
  const problemTag = req.query.problemTag;
  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email

  if (!problemTag) {
    res.status(400).send({ problem: "No problem tag" });
  }

  if (!userEmail || userEmail === undefined) {
    res.status(401).send({ problem: "Not logged in" });
  }

  if (typeof problemTag !== "string") {
    res.status(400).send({ problem: "Problem tag is not a string" });
  }

  let problem = null;

  switch (method) {
    case 'GET':
      console.log("GET", userEmail, problemTag)
      problem = await prisma.problem.findUnique({
        // @ts-expect-error
        where: {userEmail_tag: { userEmail: userEmail, tag: problemTag }},
      });
      if (problem) {
        res.status(200).json({ problem: problem })
      } else {
        res.status(404).json({ problem: "Problem not found for this user" });
      }
      break;
    case 'PUT':
      console.log("PUT", userEmail, problemTag, req.body)
      if (!("problem" in req.body)) {
        res.status(400).json({ problem: "No problem in body" });
      } 
      problem = await prisma.problem.upsert({
        // @ts-expect-error
        where: {userEmail_tag: { userEmail: userEmail, tag: problemTag }},
        update: { ...req.body.problem },
        create: { ...req.body.problem, userEmail: userEmail, tag: problemTag },
      })
      if (problem) {
        res.status(200).json({ problem: problem })
      } else {
        res.status(404).json({ problem: "Problem not found for this user" });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
    }
}

export default Problem