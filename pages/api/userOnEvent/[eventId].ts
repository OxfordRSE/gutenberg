import type { NextApiRequest, NextApiResponse } from 'next'
import { Problem } from "lib/types"
import prisma from 'lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { UserOnEvent } from '@prisma/client'

export type ResponseData = {
  userOnEvent: UserOnEvent | string;
}

const UserOnEvent= async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  const { method } = req;
  const eventIdStr = req.query.eventId;
  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email

  if (!eventIdStr) {
    res.status(400).send({ userOnEvent: "No event id" });
  }

  if (typeof eventIdStr !== "string") {
    res.status(400).send({ userOnEvent: "eventId is not a string" });
  }

  if (!userEmail || userEmail === undefined) {
    res.status(401).send({ userOnEvent: "Not logged in" });
  }
  
  const eventId = parseInt(eventIdStr as string)

  let userOnEvent = null;

  switch (method) {
    case 'GET':
      console.log("GET", userEmail, eventId)
      userOnEvent = await prisma.userOnEvent.findUnique({
        where: { userEmail_eventId: { userEmail: userEmail as string, eventId: eventId }},
      });
      if (userOnEvent) {
        res.status(200).json({ userOnEvent : userOnEvent })
      } else {
        res.status(404).json({ userOnEvent: "Problem not found for this user" });
      }
      break;
    case 'PUT':
      console.log("PUT", userEmail, userOnEvent, req.body)
      if (!("userOnEvent" in req.body)) {
        res.status(400).json({ userOnEvent: "No problem in body" });
      } 
      userOnEvent = await prisma.userOnEvent.upsert({
        where: {userEmail_eventId: { userEmail: userEmail as string, eventId: eventId}},
        update: { ...req.body.userOnEvent },
        create: { ...req.body.userOnEvent, userEmail: userEmail, eventId: eventId},
      })
      if (userOnEvent) {
        res.status(200).json({ userOnEvent: userOnEvent})
      } else {
        res.status(404).json({ userOnEvent: "userOnEvent not found for this user" });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
    }
}

export default UserOnEvent;