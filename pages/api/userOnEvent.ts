import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'
import { EventStatus, UserOnEvent } from "@prisma/client"

export type Data = {
  userOnEvent?: UserOnEvent,
  error?: string
}
type PostData = UserOnEvent

const UserOnEvent = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  if (req.method === 'POST') {
    //check if user is an instructor on the event
    const isInstructor = await prisma.userOnEvent.findMany({
      where: { user: { is: { name: session.user?.name } }, status: EventStatus.INSTRUCTOR },
    }).then((data) => data.length > 0)

    const data: PostData = req.body

    //if user is not an instructor, set status to requested
    if (!isInstructor) {
      data.status = EventStatus.REQUEST
    }
    const userOnEvent = await prisma.userOnEvent.create({data})
    res.status(200).json({ userOnEvent })
  } else if (req.method === 'GET') {
    const userOnEvents = await prisma.userOnEvent.findMany({
      where: { user: { is: { name: session.user?.name } } },
    })
    res.status(200).json({ userOnEvents })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default UserOnEvent

