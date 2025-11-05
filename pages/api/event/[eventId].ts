import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { Event } from "cypress/types/jquery"
import { markdown2Html } from "lib/markdown"

export type Event = Prisma.EventGetPayload<{
  include: { EventGroup: { include: { EventItem: true } }; UserOnEvent: { include: { user: true } } }
}> & { html?: string }

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

  if (req.method === "GET") {
    const event: Event | null = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        EventGroup: { include: { EventItem: true }, orderBy: { start: "asc" } },
        UserOnEvent: { include: { user: true } },
      },
    })

    if (!event) return res.status(404).json({ error: "Event not found" })
    // REDACT KEYS for non-admins
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
      // remove all userOnEvent that are not the current user
      event.UserOnEvent = event.UserOnEvent.filter((u) => u.user?.email === userEmail)
    }

    if (event.content) {
      event.html = markdown2Html({
        markdown: event.content,
      })
    }

    return res.status(200).json({ event })
  }

  if (req.method === "PUT") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })

    const { name, enrol, content, enrolKey, instructorKey, start, end, summary, hidden } = req.body.event
    const eventGroupData: EventGroup[] = req.body.event.EventGroup

    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

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
    // Update UserOnEvent statuses
    for (const user of req.body.event.UserOnEvent) {
      if (user.userEmail && user.status) {
        await prisma.userOnEvent.updateMany({
          where: {
            userEmail: user.userEmail,
            eventId: eventId,
          },
          data: {
            status: user.status,
          },
        })
      }
    }

    const existingGroups = await prisma.eventGroup.findMany({
      where: { eventId: eventId },
      select: { id: true },
    })
    const existingGroupIds = new Set(existingGroups.map((g) => g.id))
    const submittedGroupIds = new Set(eventGroupData.filter((g) => g.id).map((g) => g.id))
    const deletedGroupIds = [...existingGroupIds].filter((id) => !submittedGroupIds.has(id))
    // Delete groups that were removed in the form
    if (deletedGroupIds.length > 0) {
      try {
        await prisma.eventGroup.deleteMany({ where: { id: { in: deletedGroupIds } } })
      } catch (error) {
        res.status(500).json({ error: "Failed to delete one or more event groups." })
        return
      }
    }
    // Save or update each event group
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
      // Update or create EventItems for the group
      for (const item of group.EventItem) {
        if (item.id) {
          await prisma.eventItem.update({
            where: { id: item.id },
            data: {
              order: item.order,
              section: item.section,
            },
          })
        } else {
          await prisma.eventItem.create({
            data: {
              order: item.order,
              section: item.section,
              group: { connect: { id: savedGroup.id } },
            },
          })
        }
      }
    }
    // Fetch the updated event with all groups and items
    const event: Event | null = await prisma.event.findUnique({
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

    if (event.content) {
      event.html = markdown2Html({
        markdown: event.content,
      })
    }

    res.status(200).json({ event })
  }

  if (req.method === "DELETE") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })
    // delete the event
    const deletedEvent = prisma.event
      .delete({
        where: { id: eventId },
        include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
      })
      .then((deletedEvent) => {
        res.status(200).json({ event: deletedEvent })
        return
      })
      .catch((error) => {
        res.status(500).json({ error: "Problem deleting event" })
        return
      })
    // user not authorized
  } else {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
}

export default eventHandler
