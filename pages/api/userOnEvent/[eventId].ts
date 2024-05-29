import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import type { UserOnEvent } from "@prisma/client"

export type Data = {
  userOnEvent?: UserOnEvent
  error?: string
}

const UserOnEvent = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { method } = req
  const eventIdStr = req.query.eventId
  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email
  if (!eventIdStr) {
    return res.status(400).send({ error: "No event id" })
  }

  if (typeof eventIdStr !== "string") {
    return res.status(400).send({ error: "eventId is not a string" })
  }

  if (!userEmail || userEmail === undefined) {
    return res.status(401).send({ error: "Not logged in" })
  }

  const eventId = parseInt(eventIdStr as string)

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin === true

  let updatedUserOnEvent = null
  let userOnEvent = null
  switch (method) {
    case "GET":
      userOnEvent = await prisma.userOnEvent.findUnique({
        where: { userEmail_eventId: { userEmail: userEmail as string, eventId: eventId } },
      })
      if (userOnEvent) {
        res.status(200).json({ userOnEvent: userOnEvent })
        return
      } else {
        res.status(404).json({ error: "userOnEvent not found for this user" })
        return
      }
      break
    case "POST":
      userOnEvent = await prisma.userOnEvent.upsert({
        where: { userEmail_eventId: { userEmail: userEmail as string, eventId: eventId } },
        update: {},
        create: { userEmail: userEmail, eventId: eventId },
      })
      if (userOnEvent) {
        res.status(200).json({ userOnEvent: userOnEvent })
        return
      } else {
        res.status(404).json({ error: "failed to create userOnEvent" })
        return
      }
      break
    case "PUT":
      if (!isAdmin && userEmail !== req.body.userOnEvent.userEmail) {
        res.status(401).send({ error: "Not authorised" })
        return
      }
      userOnEvent = req.body.userOnEvent
      if (userOnEvent) {
        updatedUserOnEvent = await prisma.userOnEvent.update({
          where: { userEmail_eventId: { userEmail: userOnEvent.userEmail, eventId: userOnEvent.eventId } },
          data: req.body.userOnEvent,
        })
      }
      if (updatedUserOnEvent) {
        res.status(200).json({ userOnEvent: updatedUserOnEvent })
        return
      } else {
        res.status(404).json({ error: "failed to update userOnEvent" })
        return
      }
      break
    case "DELETE":
      if (!isAdmin && userEmail !== req.body.userOnEvent.userEmail) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }
      // remove user from event
      userOnEvent = req.body.userOnEvent
      const deletedUserOnEvent = prisma.userOnEvent
        .delete({
          where: { userEmail_eventId: { userEmail: userOnEvent.userEmail, eventId: userOnEvent.eventId } },
        })
        .then((deletedUserOnEvent) => {
          res.status(200).json({ userOnEvent: deletedUserOnEvent })
          return
        })
        .catch((error) => {
          res.status(500).json({ error: "Problem deleting userOnEvent" })
          return
        })
      break
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
      res.status(404).end(`Method ${method} Not Allowed`)
      break
  }
}

export default UserOnEvent
