import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { EventFull, Problem } from "lib/types"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import _, { sortBy } from "cypress/types/lodash"
import { Prisma } from "@prisma/client"
import useProfile from "lib/hooks/useProfile"

export type UsersWithUserOnEvents = Prisma.UserOnEventGetPayload<{
  include: { user: true }
}>
export type Data = {
  users?: UsersWithUserOnEvents[]
  error?: string
}

const EventUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { method } = req
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user
  const userEmail = session?.user?.email
  const eventId = parseInt(req.query.eventId as string)

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!eventId) {
    return res.status(400).json({ error: "Bad Request" })
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { UserOnEvent: { include: { user: true } }, EventGroup: { include: { EventItem: true } } },
  })

  if (!event) {
    return res.status(404).json({ error: "Event not Found" })
  }

  if (!userEmail || userEmail === undefined) {
    return res.status(401).send({ error: "Not logged in" })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isInstructor = event?.UserOnEvent.some(
    (userOnEvent) => userOnEvent?.user?.name === user?.name && userOnEvent.status === "INSTRUCTOR"
  )
  const isAdmin = currentUser?.admin === true

  let users: UsersWithUserOnEvents[] = []
  switch (method) {
    case "GET":
      if (isInstructor || isAdmin) {
        const onEvent = event?.UserOnEvent
        const emails = onEvent.map((userOnEvent) => userOnEvent?.userEmail || "")
        users = await prisma.userOnEvent.findMany({
          where: { userEmail: { in: emails }, eventId },
          include: { user: true },
          orderBy: [{ status: "asc" }, { userEmail: "asc" }],
        })
      }
      res.status(200).json({ users })
      break
    case "PUT":
      if (!isInstructor && !isAdmin) {
        return res.status(403).json({ error: "Forbidden" })
      }
      users = req.body.users
      if (!users || !Array.isArray(users)) {
        return res.status(400).json({ error: "Invalid request body" })
      }
      const updatePromises = users.map(async (userOnEvent) => {
        const userEmail = userOnEvent.userEmail as string
        const existingUserOnEvent = await prisma.userOnEvent.findUnique({
          where: { userEmail_eventId: { userEmail, eventId } },
        })
        if (!existingUserOnEvent) {
          return "UserOnEvent not found"
        }
        // only update status
        const updatedUserOnEvent = await prisma.userOnEvent.update({
          where: { userEmail_eventId: { userEmail, eventId } },
          data: { status: userOnEvent.status },
          include: { user: true },
        })
        return updatedUserOnEvent
      })
      const updatedUsersWithUserOnEvents = await await Promise.all(updatePromises)
      if (updatedUsersWithUserOnEvents.some((user) => user === "UserOnEvent not found")) {
        res.status(404).json({ error: "UserOnEvent not found" })
      } else {
        res.status(200).json({ users: updatedUsersWithUserOnEvents as UsersWithUserOnEvents[] })
      }
      break
    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}

export default EventUsers
