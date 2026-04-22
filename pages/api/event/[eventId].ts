import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"

export type Event = Prisma.EventGetPayload<{
  include: { EventGroup: { include: { EventItem: true } }; UserOnEvent: { include: { user: true } } }
}>

export type UserOnEvent = Prisma.UserOnEventGetPayload<{
  include: { user: true }
}>

export type EventGroup = Prisma.EventGroupGetPayload<{
  include: { EventItem: true }
}>

export type Data = {
  event?: Event
  error?: string
}

const eventHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const userEmail = session.user?.email || undefined
  const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
  const isAdmin = !!currentUser?.admin
  const eventId = parseInt(req.query.eventId as string, 10)

  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ error: "Invalid event id" })
  }

  if (req.method === "GET") {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        EventGroup: { include: { EventItem: true }, orderBy: { start: "asc" } },
        UserOnEvent: { include: { user: true } },
      },
    })

    if (!event) return res.status(404).json({ error: "Event not found" })
    if (!isAdmin) {
      delete (event as any).enrolKey
      delete (event as any).instructorKey
    }

    const isInstructor = event.UserOnEvent.some((u) => u.user?.email === userEmail && u.status === "INSTRUCTOR")
    const isStudent = event.UserOnEvent.some((u) => u.user?.email === userEmail && u.status === "STUDENT")

    if (!isAdmin && !isInstructor && !isStudent) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (isStudent) {
      event.UserOnEvent = event.UserOnEvent.filter((u) => u.user?.email === userEmail)
    }

    return res.status(200).json({ event })
  }

  if (req.method === "PUT") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })

    const { name, enrol, content, enrolKey, instructorKey, start, end, summary, hidden } = req.body.event
    const eventGroupData: EventGroup[] = req.body.event.EventGroup ?? []

    await prisma.event.update({
      where: { id: eventId },
      data: {
        name,
        summary,
        enrol,
        enrolKey,
        instructorKey,
        content,
        start,
        end,
        hidden,
      },
    })

    for (const user of req.body.event.UserOnEvent ?? []) {
      if (user.userEmail && user.status) {
        await prisma.userOnEvent.updateMany({
          where: {
            userEmail: user.userEmail,
            eventId,
          },
          data: {
            status: user.status,
          },
        })
      }
    }

    const existingGroups = await prisma.eventGroup.findMany({
      where: { eventId },
      select: { id: true },
    })
    const existingGroupIds = new Set(existingGroups.map((group) => group.id))
    const submittedGroupIds = new Set(eventGroupData.filter((group) => group.id).map((group) => group.id))
    const deletedGroupIds = [...existingGroupIds].filter((id) => !submittedGroupIds.has(id))

    if (deletedGroupIds.length > 0) {
      try {
        await prisma.eventGroup.deleteMany({ where: { id: { in: deletedGroupIds } } })
      } catch (error) {
        res.status(500).json({ error: "Failed to delete one or more event groups." })
        return
      }
    }

    for (const group of eventGroupData) {
      let savedGroup
      if (group.id && existingGroupIds.has(group.id)) {
        savedGroup = await prisma.eventGroup.update({
          where: { id: group.id },
          data: {
            name: group.name,
            summary: group.summary,
            content: group.content,
            location: group.location,
            start: group.start,
            end: group.end,
          },
        })
      } else {
        savedGroup = await prisma.eventGroup.create({
          data: {
            name: group.name,
            summary: group.summary,
            content: group.content,
            location: group.location,
            start: group.start,
            end: group.end,
            event: { connect: { id: eventId } },
          },
        })
      }

      await prisma.eventItem.deleteMany({ where: { groupId: savedGroup.id } })

      if (group.EventItem.length > 0) {
        await prisma.eventItem.createMany({
          data: group.EventItem.map((item) => ({
            order: typeof item.order === "string" ? parseInt(item.order, 10) : item.order,
            section: item.section,
            groupId: savedGroup.id,
          })),
        })
      }
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        EventGroup: { include: { EventItem: true }, orderBy: { start: "asc" } },
        UserOnEvent: { include: { user: true } },
      },
    })

    if (!event) {
      res.status(404).json({ error: "Problem updating event, could not get from the database" })
      return
    }

    res.status(200).json({ event })
    return
  }

  if (req.method === "DELETE") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })
    prisma.event
      .delete({
        where: { id: eventId },
        include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
      })
      .then((deletedEvent) => {
        res.status(200).json({ event: deletedEvent })
        return
      })
      .catch(() => {
        res.status(500).json({ error: "Problem deleting event" })
        return
      })
  } else {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
}

export default eventHandler
