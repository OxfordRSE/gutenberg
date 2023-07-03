import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { Event } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'

export type Data = {
  events?: Event[], 
  event?: Event,
  error?: string, 
}


const Events = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userEmail = session.user?.email || undefined;

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  const isAdmin = currentUser?.admin;

  if (req.method === 'POST') {
    if (!isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const event = await prisma.event.create({data: {}});
    res.status(201).json({ event: event });
  } else {
    let events: Event[] = await prisma.event.findMany();
    res.status(200).json({ events: events });
  }
}

export default Events
