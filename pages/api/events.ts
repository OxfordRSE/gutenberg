import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { Event } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  events: Event[] 
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const session = await getServerSession(req, res, authOptions)
  let events: Event[] = []
  if (session) {
    events = await prisma.event.findMany({
      where: { UserOnEvent: { some: { user: { is: { name: session.user?.name } } } } },
      include: { EventGroup: { include: { EventItem: true } }},
    });
  }
  res.status(200).json(events)
}
