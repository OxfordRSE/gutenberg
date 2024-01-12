import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import UserOnEvent from "../userOnEvent/[eventId]"

export type CommentThread = Prisma.CommentThreadGetPayload<{
  include: { Comment: true }
}>

export type Comment = Prisma.CommentGetPayload<{}>

export type Data = {
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

  const commentThreadId = req.query.commentThreadId as string

  const commentThread = await prisma.commentThread.findUnique({
    where: { id: parseInt(commentThreadId) },
    include: { Comment: true },
  })

  if (!commentThread) {
    res.status(404).json({ error: `Could not find commentThread ${commentThread}` })
    return
  }

  const eventId = commentThread.eventId

  const userOnEvent = await prisma.userOnEvent.findUnique({
    where: {
      userEmail_eventId: { userEmail, eventId },
    },
  })

  if (!userOnEvent) {
    res.status(404).json({ error: `Could not find userOnEvent ${userEmail} ${eventId}` })
    return
  }

  const isInstructorStudent = userOnEvent.status === "INSTRUCTOR" || userOnEvent.status === "STUDENT"

  if (!isAdmin && !isInstructorStudent) {
    res.status(401).json({ error: "Unauthorized, should be student or instructor on event" })
    return
  }

  if (req.method === "GET") {
    res.status(200).json({ commentThread })
  } else if (req.method === "DELETE") {
    if (!isAdmin && commentThread.createdByEmail !== userEmail) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const deletedCommentThread = await prisma.commentThread.delete({
      where: { id: parseInt(commentThreadId) },
      include: { Comment: true },
    })
    res.status(200).json({ commentThread: deletedCommentThread })
  } else if (req.method === "PUT") {
    req.body.commentThread.Comment = undefined
    if (!isAdmin && commentThread.createdByEmail !== userEmail) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const updatedCommentThread = await prisma.commentThread.update({
      where: { id: parseInt(commentThreadId) },
      data: req.body.commentThread,
      include: { Comment: true },
    })
    res.status(200).json({ commentThread: updatedCommentThread })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentThreadHandler
