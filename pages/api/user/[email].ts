import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"

export type User = Prisma.UserGetPayload<{}>

export type UserPublic = Prisma.UserGetPayload<{
  select: {
    email: true
    name: true
    image: true
  }
}>

export type Data = {
  user?: UserPublic | User
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

  const reqEmail = req.query.email as string

  if (req.method === "GET") {
    if (isAdmin || reqEmail === userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: reqEmail },
      })
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.status(200).json({ user })
    } else {
      const user = await prisma.user.findUnique({
        where: { email: reqEmail },
        select: {
          email: true,
          name: true,
          image: true,
        },
      })
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.status(200).json({ user })
    }
  } else if (req.method === "PUT") {
    if (!isAdmin && !(reqEmail === userEmail)) {
      res.status(401).json({ error: "Unauthorized, not user owner or admin" })
      return
    }
    const user = await prisma.user.update({
      where: { email: reqEmail },
      data: req.body,
    })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default commentHandler
