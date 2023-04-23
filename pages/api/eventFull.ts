import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { EventFull } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = EventFull[] 

const EventsFull = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const session = await getServerSession(req, res, authOptions)
  let events: EventFull[] = []
  if (session) {
    events = await prisma.event.findMany({
      // where user is user and status is not requested\
      where: { UserOnEvent: { some: { user: { is: { name: session?.user?.name } }, status: { in: [ "INSTRUCTOR", "STUDENT"] } } } },
      include: { EventGroup: { include: { EventItem: true } }},
    });
  }
  res.status(200).json(events)
}

export default EventsFull