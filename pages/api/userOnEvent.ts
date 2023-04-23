import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { EventFull, UserOnEventPost } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'
import { EventStatus, UserOnEvent } from "@prisma/client"

type GetData = UserOnEvent | UserOnEvent[]
type PostData = UserOnEventPost

const UserOnEvent = async (
  req: NextApiRequest,
  res: NextApiResponse<GetData>
) => {
  const session = await getServerSession(req, res, authOptions)
  let userOnEvent: GetData = []
  if (!session) {
    res.status(401).json(userOnEvent)
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
    userOnEvent = await prisma.userOnEvent.create({data})
    res.status(200).json(userOnEvent)
  } else if (req.method === 'GET') {
    userOnEvent = await prisma.userOnEvent.findMany({
      where: { user: { is: { name: session.user?.name } } },
    })
    res.status(200).json(userOnEvent)
  } else {
    res.status(405).json(userOnEvent)
  }
}

export default UserOnEvent

