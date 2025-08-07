import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { Event } from "cypress/types/jquery"

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
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin

  const eventId = req.query.eventId as string

  if (req.method === "GET") {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        EventGroup: { include: { EventItem: true }, orderBy: { start: "asc" } },
        UserOnEvent: { include: { user: true } },
      },
    })

    if (!event) {
      res.status(404).json({ error: "Event not found" })
      return
    }

    const isInstructor = event?.UserOnEvent?.some(
      (userOnEvent) => userOnEvent?.user?.email === userEmail && userOnEvent?.status === "INSTRUCTOR"
    )
    const isStudent = event?.UserOnEvent?.some(
      (userOnEvent) => userOnEvent?.user?.email === userEmail && userOnEvent?.status === "STUDENT"
    )

    if (isStudent) {
      // remove all userOnEvent that are not the current user
      const userOnEvent = event.UserOnEvent.filter((userOnEvent) => userOnEvent?.user?.email === userEmail)
      event.UserOnEvent = userOnEvent
    }

    if (!isAdmin && !isInstructor && !isStudent) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    res.status(200).json({ event })
  } else if (req.method === "PUT") {
    const { name, enrol, content, enrolKey, instructorKey, start, end, summary, hidden } = req.body.event
    const eventGroupData: EventGroup[] = req.body.event.EventGroup

    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    // 1. Update event core fields
    await prisma.event.update({
      where: { id: parseInt(eventId) },
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

    // 2. Handle EventGroup deletions
    const existingGroups = await prisma.eventGroup.findMany({
      where: { eventId: parseInt(eventId) },
      select: { id: true },
    })
    const existingGroupIds = new Set(existingGroups.map((g) => g.id))
    const submittedGroupIds = new Set(eventGroupData.filter((g) => g.id).map((g) => g.id))
    const deletedGroupIds = [...existingGroupIds].filter((id) => !submittedGroupIds.has(id))

    if (deletedGroupIds.length > 0) {
      await prisma.eventGroup.deleteMany({ where: { id: { in: deletedGroupIds } } })
    }

    // 3. Upsert EventGroups and EventItems
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
            event: { connect: { id: parseInt(eventId) } },
          },
        })
      }

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

    // 4. Return updated event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        EventGroup: { include: { EventItem: true }, orderBy: { start: "asc" } },
        UserOnEvent: { include: { user: true } },
      },
    })

    if (!event) {
      res.status(404).json({ error: "Problem updating event, could not get from database" })
      return
    }

    res.status(200).json({ event })
  } else if (req.method === "DELETE") {
    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    // delete the event
    const deletedEvent = prisma.event
      .delete({
        where: { id: parseInt(eventId) },
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
