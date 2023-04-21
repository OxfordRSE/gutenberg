import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { Event } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = Event[] 

const Events = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  let events: Event[] = await prisma.event.findMany();
  res.status(200).json(events)
}

export default Events