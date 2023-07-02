import type { NextApiRequest, NextApiResponse } from 'next'
import { Problem } from "lib/types"
import prisma from 'lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { basePath } from 'lib/basePath'
import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from 'swr'

import { Prisma } from "@prisma/client";

export type ResponseData = {
  problem?: Problem;
  error?: string;
}

// hook that gets a problem
const problemFetcher: Fetcher<ResponseData, string> = url => fetch(url).then(r => r.json())
export const useProblem = (sectionId: string, problemTag: string): { problem: Problem | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<ResponseData> } => {
  const { data, isLoading, error, mutate } = useSWR(`${basePath}/api/problems/${sectionId}/${problemTag}`, problemFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const problem = data && 'problem' in data ? data.problem : undefined;
  return { problem, error: errorString, isLoading, mutate}
}

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


const Problem = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { method } = req;
  const problemTag = req.query.problemTag;
  const sectionTag = req.query.sectionTag;
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user
  const userEmail = session?.user?.email

  if (!problemTag) {
    res.status(400).send({ error: "No problem tag" });
  }

  if (!sectionTag) {
    res.status(400).send({ error: "No section tag" });
  }

  if (!userEmail || userEmail === undefined) {
    res.status(401).send({ error: "Not logged in" });
  }

  if (typeof problemTag !== "string") {
    res.status(400).send({ error: "Problem tag is not a string" });
  }

  if (typeof sectionTag !== "string") {
    res.status(400).send({ error: "Section tag is not a string" });
  }

  let problem = null;

  switch (method) {
    case 'GET':
      problem = await prisma.problem.findUnique({
        where: { userEmail_tag_section: { userEmail: userEmail as string, tag: problemTag as string, section: sectionTag as string }},
      });
      if (problem) {
        res.status(200).json({ problem: problem })
      } else {
        res.status(404).json({ error: "Problem not found for this user" });
      }
      break;
    case 'PUT':
      if (!("problem" in req.body)) {
        res.status(400).json({ error: "No problem in body" });
      } 
      problem = await prisma.problem.upsert({
        where: {userEmail_tag_section: { userEmail: userEmail as string, tag: problemTag as string, section: sectionTag as string }},
        update: { ...req.body.problem },
        create: { ...req.body.problem, userEmail: userEmail, tag: problemTag, section: sectionTag },
      })
      if (problem) {
        res.status(200).json({ problem: problem })
      } else {
        res.status(404).json({ error: "Problem not found for this user" });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
    }
}

export default Problem;