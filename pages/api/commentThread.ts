import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { event } from "cypress/types/jquery"
import { is } from "cypress/types/bluebird"

export type CommentThread = Prisma.CommentThreadGetPayload<{
  include: { Comment: true }
}>

export type CommentThreadPost = Prisma.CommentThreadCreateManyCreatedByInput

export type Comment = Prisma.CommentGetPayload<{}>

export type Event = Prisma.EventGetPayload<{}>

export type Data = {
  commentThreads?: CommentThread[]
  commentThread?: CommentThread
  error?: string
}

const commentThreadHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined

  if (!userEmail) {
    res.status(401).json({ error: "Unauthorized, no email" })
    return
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin

  if (req.method === "GET") {
    const eventId = req.query.eventId as string
    let isInstructorStudent = false
    if (eventId) {
      isInstructorStudent = Boolean(
        await prisma.userOnEvent.findFirst({
          where: {
            user: { email: userEmail },
            status: { in: ["INSTRUCTOR", "STUDENT"] },
            event: { id: parseInt(eventId) },
          },
        })
      )
    }
    if (!isAdmin && !(eventId && isInstructorStudent)) {
      res.status(401).json({ error: "Unauthorized, not admin or instructor/student on event" })
      return
    }

    let commentThreads = []
    if (eventId) {
      commentThreads = await prisma.commentThread.findMany({
        where: { eventId: parseInt(eventId) },
        include: { Comment: true },
      })
    } else {
      commentThreads = await prisma.commentThread.findMany({
        include: { Comment: true },
      })
    }

    res.status(200).json({ commentThreads })
  } else if (req.method === "POST") {
    const { eventId, textRef, textRefStart, textRefEnd, section, initialCommentText } = req.body.commentThread
    if (!eventId) {
      res.status(400).json({ error: "Bad request, no eventId" })
      return
    }
    const isInstructorStudent = Boolean(
      await prisma.userOnEvent.findFirst({
        where: {
          user: { email: userEmail },
          status: { in: ["INSTRUCTOR", "STUDENT"] },
          event: { id: parseInt(eventId) },
        },
      })
    )
    if (!isAdmin && !isInstructorStudent) {
      res.status(401).json({ error: "Unauthorized, not admin or instructor/student on event" })
      return
    }

    const commentThread = await prisma.commentThread.create({
      data: {
        eventId: parseInt(eventId),
        createdByEmail: userEmail,
        textRef,
        textRefStart,
        textRefEnd,
        section,
        Comment: {
          create: {
            createdByEmail: userEmail,
            markdown: initialCommentText,
            index: 0,
          },
        },
      },
      include: { Comment: true },
    })

    res.status(200).json({ commentThread })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentThreadHandler
