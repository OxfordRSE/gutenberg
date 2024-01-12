import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"

export type EventGroup = Prisma.EventGroupGetPayload<{
  include: { EventItem: true }
}>

export type EventItem = Prisma.EventItemGetPayload<{}>

export type Data = {
  eventGroup?: EventGroup
  error?: string
}

const eventHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

  const eventGroupId = req.query.eventGroupId as string

  if (req.method === "GET") {
    const isInstructorStudent = await prisma.userOnEvent.findFirst({
      where: {
        user: { email: userEmail },
        status: { in: ["INSTRUCTOR", "STUDENT"] },
        event: { EventGroup: { some: { id: parseInt(eventGroupId) } } },
      },
    })

    const hasAccess = isAdmin || isInstructorStudent

    const eventGroup = await prisma.eventGroup.findUnique({
      where: { id: parseInt(eventGroupId) },
      include: { EventItem: true },
    })

    if (!eventGroup) {
      res.status(404).json({ error: "EventGroup not found" })
      return
    }

    if (!hasAccess) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    res.status(200).json({ eventGroup })
  } else if (req.method === "PUT") {
    const { name, content, start, end, summary, location } = req.body.eventGroup
    const eventItemData: EventItem[] = req.body.eventGroup.EventItem

    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    // make sure EventItem.order is a number
    eventItemData.forEach((eventItem) => {
      if (typeof eventItem.order === "string") {
        eventItem.order = parseInt(eventItem.order)
      }
    })
    const updatedEventGroup = await prisma.eventGroup.update({
      where: { id: parseInt(eventGroupId) },
      data: {
        name,
        content,
        start,
        end,
        summary,
        location,
        EventItem: {
          deleteMany: {},
          create: eventItemData.map((eventItem) => ({ ...eventItem, id: undefined, groupId: undefined })),
        },
      },
      include: { EventItem: true },
    })

    if (!updatedEventGroup) {
      res.status(404).json({ error: "Problem updating eventGroup, could not get from dbase" })
      return
    }
    res.status(200).json({ eventGroup: updatedEventGroup })
  } else if (req.method === "DELETE") {
    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const deletedEventGroup = await prisma.eventGroup.delete({
      where: { id: parseInt(eventGroupId) },
      include: { EventItem: true },
    })
    res.status(200).json({ eventGroup: deletedEventGroup })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default eventHandler
