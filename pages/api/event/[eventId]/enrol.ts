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

  // load keys server-side
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, enrolKey: true, instructorKey: true },
  })
  if (!event) return res.status(404).json({ error: "Event not found" })

  // UonE exists?
  const existing = await prisma.userOnEvent.findUnique({
    where: { userEmail_eventId: { userEmail, eventId } },
    select: userOnEventSelect,
  })

  const base: PublicUserOnEvent =
    existing ??
    (await prisma.userOnEvent.create({
      data: { userEmail, eventId, status: "REQUEST" },
      select: userOnEventSelect,
    }))

  let nextStatus: EventStatus | null = null

  if (enrolKey && enrolKey === event.enrolKey) nextStatus = EventStatus.STUDENT
  else if (enrolKey && enrolKey === event.instructorKey) nextStatus = EventStatus.INSTRUCTOR
  else if (enrolKey && enrolKey.trim() !== "") {
    return res.status(400).json({ error: "Invalid enrolment key" })
  }

  const updated: PublicUserOnEvent =
    nextStatus === null
      ? base
      : await prisma.userOnEvent.update({
          where: { userEmail_eventId: { userEmail, eventId } },
          data: { status: nextStatus },
          select: userOnEventSelect,
        })

  // construct a stable synthetic id in place of the composite primary key
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
