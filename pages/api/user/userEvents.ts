import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma, UserOnEvent, Problem, Event } from "@prisma/client"

export type User = Prisma.UserGetPayload<{}>

export type UserPublic = Prisma.UserGetPayload<{
  select: {
    email: true
    name: true
    image: true
  }
}>

export type Data = {
  userEvents?: Event[]
  problems?: Problem[]
  userOnEvents?: UserOnEvent[]
  error?: string
}

const commentHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin
  const reqEmail = req.body.userEmail as string
  if (!reqEmail) {
    res.status(400).json({ error: "No email provided" })
    return
  }
  let userEvents: Event[] = []
  if (req.method === "PUT") {
    if (isAdmin || reqEmail === userEmail) {
      prisma.userOnEvent
        .findMany({
          where: { userEmail: reqEmail },
        })
        .catch((e) => [])
        .then((userOnEvents) => {
          for (const event of userOnEvents) {
            prisma.event
              .findUnique({
                where: { id: event.eventId },
                include: { EventGroup: { include: { EventItem: true } } },
              })
              .then((e) => {
                if (e) {
                  userEvents.push(e)
                }
              })
              .then(() => {
                prisma.problem
                  .findMany({
                    where: { userEmail: reqEmail },
                  })
                  .then((problems) => {
                    res.status(200).json({ userEvents, problems, userOnEvents })
                  })
              })
          }
        })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentHandler
