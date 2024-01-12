import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { Event } from "cypress/types/jquery"

export type Event = Prisma.EventGetPayload<{}>

export type Comment = Prisma.CommentGetPayload<{}>

export type Data = {
  comment?: Comment
  error?: string
}

const commentHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

  const commentId = req.query.commentId as string

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  })

  if (!comment) {
    res.status(404).json({ error: "Comment not found" })
    return
  }

  if (req.method === "GET") {
    const isInstructorStudent = Boolean(
      await prisma.userOnEvent.findFirst({
        where: {
          user: { email: userEmail },
          status: { in: ["INSTRUCTOR", "STUDENT"] },
          event: { CommentThread: { some: { Comment: { some: { id: parseInt(commentId) } } } } },
        },
      })
    )

    if (!isAdmin && !isInstructorStudent) {
      res.status(401).json({ error: "Unauthorized, not instructor or student or admin" })
    }

    res.status(200).json({ comment })
  } else if (req.method === "PUT") {
    if (!isAdmin && !(comment.createdByEmail === userEmail)) {
      res.status(401).json({ error: "Unauthorized, not comment owner or admin" })
      return
    }
    const { markdown } = req.body.comment
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        markdown,
      },
    })

    res.status(200).json({ comment: updatedComment })
  } else if (req.method === "DELETE") {
    if (!isAdmin && !(comment.createdByEmail === userEmail)) {
      res.status(401).json({ error: "Unauthorized, not comment owner or admin" })
      return
    }
    const deletedComment = await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    })
    res.status(200).json({ comment: deletedComment })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentHandler
