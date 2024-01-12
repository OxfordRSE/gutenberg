import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { event } from "cypress/types/jquery"
import { is } from "cypress/types/bluebird"
import { max } from "cypress/types/lodash"

export type Comment = Prisma.CommentGetPayload<{}>

export type Event = Prisma.EventGetPayload<{}>

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

  if (!userEmail) {
    res.status(401).json({ error: "Unauthorized, no email" })
    return
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  const isAdmin = currentUser?.admin

  if (req.method === "POST") {
    const { threadId } = req.body.comment
    if (!threadId) {
      res.status(400).json({ error: "Bad request, no threadId" })
      return
    }
    const thread = await prisma.commentThread.findUnique({
      where: { id: parseInt(threadId) },
      include: { Comment: true },
    })
    const isInstructorStudent = Boolean(
      await prisma.userOnEvent.findFirst({
        where: {
          user: { email: userEmail },
          status: { in: ["INSTRUCTOR", "STUDENT"] },
          event: { id: thread?.eventId },
        },
      })
    )

    if (!isAdmin && !isInstructorStudent) {
      res.status(401).json({ error: "Unauthorized, not admin or instructor/student on event" })
      return
    }

    const maxIndex = thread?.Comment?.reduce((max, comment) => {
      return comment.index > max ? comment.index : max
    }, 0)
    const comment = await prisma.comment.create({
      data: {
        threadId: parseInt(threadId),
        createdByEmail: userEmail,
        index: maxIndex ? maxIndex + 1 : 0,
      },
    })

    res.status(200).json({ comment })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentHandler
