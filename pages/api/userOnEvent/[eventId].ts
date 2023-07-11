import type { NextApiRequest, NextApiResponse } from 'next'
import { Problem } from "lib/types"
import prisma from 'lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { UserOnEvent } from '@prisma/client'
import { basePath } from 'lib/basePath'

export type Data = {
  userOnEvent?: UserOnEvent,
  error?: string,
}

// function that returns a promise that does a PUT request for this endpoint
export const putUserOnEvent = async (eventId: number, userOnEvent: UserOnEvent): Promise<Event> => {
  const apiPath = `${basePath}/api/userOnEvent/${eventId}`
  const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userOnEvent })
  };
  return fetch(apiPath, requestOptions)
      .then(response => response.json())
}

const UserOnEvent= async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { method } = req;
  const eventIdStr = req.query.eventId;
  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email

  if (!eventIdStr) {
    return res.status(400).send({ error: "No event id" });
  }

  if (typeof eventIdStr !== "string") {
    return res.status(400).send({ error: "eventId is not a string" });
  }

  if (!userEmail || userEmail === undefined) {
    return res.status(401).send({ error: "Not logged in" });
  }
  
  const eventId = parseInt(eventIdStr as string)

  let userOnEvent = null;

  switch (method) {
    case 'GET':
      userOnEvent = await prisma.userOnEvent.findUnique({
        where: { userEmail_eventId: { userEmail: userEmail as string, eventId: eventId }},
      });
      if (userOnEvent) {
        res.status(200).json({ userOnEvent : userOnEvent })
      } else {
        res.status(404).json({ error: "userOnEvent not found for this user" });
      }
      break;
    case 'POST':
      userOnEvent = await prisma.userOnEvent.upsert({
        where: {userEmail_eventId: { userEmail: userEmail as string, eventId: eventId}},
        update: { },
        create: { userEmail: userEmail, eventId: eventId }
      })
      if (userOnEvent) {
        res.status(200).json({ userOnEvent: userOnEvent})
      } else {
        res.status(404).json({ error: "failed to create userOnEvent" });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
    }
}

export default UserOnEvent;