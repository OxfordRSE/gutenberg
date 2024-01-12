import { PrismaClient, User } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

const prisma = new PrismaClient()

export type GetData = {
  users?: User[]
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!currentUser) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  if (currentUser.admin) {
    const users = await prisma.user.findMany()
    res.status(200).json({ users })
  } else {
    res.status(200).json({ users: [currentUser] })
  }
}
