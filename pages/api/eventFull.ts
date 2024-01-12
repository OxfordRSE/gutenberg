import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { EventFull } from "lib/types"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { basePath } from "lib/basePath"

export type Data = {
  events?: EventFull[]
  error?: string
}

const EventsFull = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  const events = await prisma.event.findMany({
    // where user is user and status is not requested\
    where: {
      UserOnEvent: { some: { user: { is: { name: session?.user?.name } }, status: { in: ["INSTRUCTOR", "STUDENT"] } } },
    },
    include: { EventGroup: { orderBy: { start: "asc" }, include: { EventItem: { orderBy: { order: "asc" } } } } },
    orderBy: { start: "asc" },
  })
  res.status(200).json({ events })
}

export default EventsFull
