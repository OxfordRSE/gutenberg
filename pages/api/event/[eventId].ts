import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'
import useSWR, { Fetcher, KeyedMutator, useSWRConfig } from 'swr'
import { basePath } from "lib/basePath"
import { Prisma } from "@prisma/client"
import { is } from "cypress/types/bluebird"

export type Event = Prisma.EventGetPayload<{
    include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
}>

export type Data = {
  event?: Event;
  error?: string;
}

// hook that gets a event 
const eventFetcher: Fetcher<Data, string> = url => fetch(url).then(r => r.json())
export const useEvent = (id: number): { event: Event | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<Data> } => {
  const { data, isLoading, error, mutate } = useSWR(`${basePath}/api/event/${id}`, eventFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const event = data && 'event' in data ? data.event : undefined;
  return { event, error: errorString, isLoading, mutate}
}

// function that returns a promise that does a PUT request for this endpoint
export const putEvent = async (id: number, event: Event): Promise<Event> => {
  const apiPath = `${basePath}/api/event/${id}`
  const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event })
  };
  return fetch(apiPath, requestOptions)
      .then(response => response.json())
}

const eventHandler = async (
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

  const eventId = req.query.eventId as string;

  if (req.method === 'GET') {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
    });


    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const isInstructor = event?.UserOnEvent?.some((userOnEvent) => userOnEvent?.user?.email === userEmail && userOnEvent?.role === 'INSTRUCTOR');
    const isStudent = event?.UserOnEvent?.some((userOnEvent) => userOnEvent?.user?.email === userEmail && userOnEvent?.role === 'STUDENT');

    if (isStudent) {
      // remove all userOnEvent that are not the current user
      const userOnEvent = event.UserOnEvent.filter((userOnEvent) => userOnEvent?.user?.email === userEmail);
      event.UserOnEvent = userOnEvent;
    }

    if (!isAdmin && !isInstructor && !isStudent) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(200).json({ event });
  } else if (req.method === 'PUT') {
    const { name, enrol, content, start, end, summary, EventGroup, UserOnEvent } = req.body;

    if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized' });
        return; 
    }

    let updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        name,
        summary,
        enrol,
        content,
        start,
        end,
        EventGroup: {
            deleteMany: {},
            createMany: {
                data: EventGroup,
            }
        },
        UserOnEvent: {
            deleteMany: {},
            createMany: {
                data: UserOnEvent,
            }
        },
      },
      include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
    });
    for (let i = 0; i < EventGroup.length; i++) {
        const group = EventGroup[i];
        let newGroup = updatedEvent.EventGroup[i];
        if (group.EventItem.length > 0) {
            const createdItems = await prisma.eventItem.createMany({
                data: group.EventItem.map((item) => ({
                    ...item,
                    EventGroup: { connect: { id: newGroup.id } },
                })),
            });
        }
    }
    const event = await prisma.event.findUnique({
      where: { id: updatedEvent.id },
      include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
    });
    if (!event) {
      res.status(404).json({ error: 'Problem updating event, could not get from dbase' });
      return;
    }
    res.status(200).json({ event });
  } else if (req.method === 'DELETE') {
    if (!isAdmin) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const deletedEvent = await prisma.event.delete({
      where: { id: parseInt(eventId) },
      include: { EventGroup: { include: { EventItem: true } }, UserOnEvent: { include: { user: true } } },
    });
    res.status(200).json({ event: deletedEvent });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default eventHandler