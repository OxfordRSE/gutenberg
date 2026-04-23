import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"
import type { EventFull } from "lib/types"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma, UserOnEvent, Problem } from "@prisma/client"

export type User = Prisma.UserGetPayload<{}>

export type UserPublic = Prisma.UserGetPayload<{
  select: {
    email: true
    name: true
    image: true
  }
}>

export type Data = {
  userEvents?: EventFull[]
  problems?: Problem[]
  userOnEvents?: UserOnEvent[]
  error?: string
}

const userEventsHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "PUT") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined
  const reqEmail = req.body?.userEmail as string | undefined
  if (!reqEmail) {
    res.status(400).json({ error: "No email provided" })
    return
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin
  if (!isAdmin && reqEmail !== userEmail) {
    res.status(403).json({ error: "Forbidden" })
    return
  }

  const [userOnEvents, problems] = await Promise.all([
    prisma.userOnEvent.findMany({
      where: { userEmail: reqEmail },
    }),
    prisma.problem.findMany({
      where: { userEmail: reqEmail },
    }),
  ])

  const eventIds = userOnEvents.map((userOnEvent) => userOnEvent.eventId)
  const events: EventFull[] =
    eventIds.length === 0
      ? []
      : await prisma.event.findMany({
          where: { id: { in: eventIds } },
          include: { EventGroup: { include: { EventItem: true } } },
        })

  const eventsById = new Map(events.map((event) => [event.id, event]))
  const userEvents = eventIds.flatMap((eventId) => {
    const event = eventsById.get(eventId)
    return event ? [event] : []
  })

  res.status(200).json({ userEvents, problems, userOnEvents })
}

export default userEventsHandler
