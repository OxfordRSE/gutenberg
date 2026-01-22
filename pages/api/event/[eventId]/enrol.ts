// pages/api/event/[eventId]/enrol.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { EventStatus, Prisma } from "@prisma/client"

const userOnEventSelect = { eventId: true, userEmail: true, status: true } as const
type PublicUserOnEvent = Prisma.UserOnEventGetPayload<{ select: typeof userOnEventSelect }>

type Data = { userOnEvent: { id: string; eventId: number; userEmail: string; status: EventStatus } } | { error: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const userEmail = session.user?.email!
  const eventId = parseInt(req.query.eventId as string, 10)
  const { enrolKey } = req.body as { enrolKey?: string }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, enrolKey: true, instructorKey: true },
  })
  if (!event) return res.status(404).json({ error: "Event not found" })

  const normalizedKey = enrolKey?.trim()

  let nextStatus: EventStatus | null = null
  if (!normalizedKey) {
    const existing = await prisma.userOnEvent.findUnique({
      where: { userEmail_eventId: { userEmail, eventId } },
      select: userOnEventSelect,
    })
    if (existing) {
      const syntheticId = `${existing.userEmail}:${existing.eventId}`
      return res.status(200).json({
        userOnEvent: {
          id: syntheticId,
          eventId: existing.eventId,
          userEmail: existing.userEmail,
          status: existing.status,
        },
      })
    }
    nextStatus = EventStatus.REQUEST
  }
  else if (normalizedKey === event.enrolKey) nextStatus = EventStatus.STUDENT
  else if (normalizedKey === event.instructorKey) nextStatus = EventStatus.INSTRUCTOR
  else return res.status(400).json({ error: "Invalid enrolment key" })

  // Create or update the UserOnEvent record with the matched role
  const updated: PublicUserOnEvent = await prisma.userOnEvent.upsert({
    where: { userEmail_eventId: { userEmail, eventId } },
    update: { status: nextStatus },
    create: { userEmail, eventId, status: nextStatus },
    select: userOnEventSelect,
  })

  const syntheticId = `${updated.userEmail}:${updated.eventId}`

  return res.status(200).json({
    userOnEvent: {
      id: syntheticId,
      eventId: updated.eventId,
      userEmail: updated.userEmail,
      status: updated.status,
    },
  })
}
