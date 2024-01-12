// if you are an instructuro on this event returns all the problems that are in tags in eventItems for this event, for all students enrolled on this event. If you are a student on the event only returns your own problems.

import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { EventFull, Problem } from "lib/types"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import _ from "cypress/types/lodash"

export type Data = {
  problems?: Problem[]
  error?: string
}

const Problems = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user
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

  const eventItemTags = event.EventGroup.reduce(
    (acc: string[], eventGroup) => {
      return [...acc, ...eventGroup.EventItem.map((eventItem) => eventItem.section)]
    },
    [""]
  )

  const isStudent = event?.UserOnEvent.some(
    (userOnEvent) => userOnEvent?.user?.name === user?.name && userOnEvent.status === "STUDENT"
  )
  const isInstructor = event?.UserOnEvent.some(
    (userOnEvent) => userOnEvent?.user?.name === user?.name && userOnEvent.status === "INSTRUCTOR"
  )

  let problems: Problem[] = []
  if (isInstructor) {
    const students = event?.UserOnEvent.filter((userOnEvent) => userOnEvent.status === "STUDENT").map(
      (userOnEvent) => userOnEvent.user
    )
    const studentEmails = students.map((student) => student?.email || "")
    problems = await prisma.problem.findMany({
      where: { section: { in: eventItemTags }, userEmail: { in: studentEmails } },
    })
  } else if (isStudent) {
    problems = await prisma.problem.findMany({
      where: { section: { in: eventItemTags }, userEmail: user?.email as string },
    })
  }

  res.status(200).json({ problems: problems })
}

export default Problems
