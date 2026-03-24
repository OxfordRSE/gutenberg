import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { Event } from "lib/types"
import prisma from "lib/prisma"
import { buildEventCreateDataFromCourse } from "lib/eventBlueprint"

import type { NextApiRequest, NextApiResponse } from "next"

export type Data = {
  events?: Event[]
  event?: Event
  error?: string
}

const parseStartAt = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const Events = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

  if (req.method === "POST") {
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }
    if (!req.body) {
      const event = await prisma.event.create({ data: {} })
      res.status(201).json({ event: event })
    } else {
      const parsedStartAt = parseStartAt(req.body.startAt)
      if (parsedStartAt === null) {
        res.status(400).json({ error: "Invalid start date" })
        return
      }
      req.body.startAt = undefined

      const sourceCourseId =
        typeof req.body.sourceCourseId === "number"
          ? req.body.sourceCourseId
          : parseInt(req.body.sourceCourseId as string, 10)

      if (sourceCourseId) {
        const startAt = parsedStartAt ?? new Date()

        const sourceCourse = await prisma.course.findUnique({
          where: { id: sourceCourseId },
          include: {
            CourseGroup: { include: { CourseItem: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
            CourseItem: { orderBy: { order: "asc" } },
          },
        })

        if (!sourceCourse) {
          res.status(404).json({ error: "Course not found" })
          return
        }

        const event = await prisma.event.create({
          data: buildEventCreateDataFromCourse(sourceCourse, startAt),
        })
        res.status(201).json({ event })
        return
      }

      req.body.UserOnEvent = undefined
      req.body.EventGroup = undefined
      req.body.id = undefined
      if (parsedStartAt) {
        req.body.start = parsedStartAt
        req.body.end = parsedStartAt
      }
      const event = await prisma.event.create({ data: req.body })
      res.status(201).json({ event: event })
    }
  } else if (req.method === "GET") {
    if (isAdmin) {
      const events: Event[] = await prisma.event.findMany()
      res.status(200).json({ events: events })
    } else {
      const events: Event[] = await prisma.event.findMany({
        where: { hidden: false },
      })
      // REDACT KEYS for non-admins
      events.forEach((event) => {
        delete (event as any).enrolKey
        delete (event as any).instructorKey
      })
      res.status(200).json({ events: events })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default Events
