import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { Event } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'
import { Fetcher } from "swr"
import { basePath } from "lib/basePath"

export type Data = {
  events?: Event[], 
  event?: Event,
  error?: string, 
}

// GET /api/events
const eventsFetcher: Fetcher<Event[], string> = url => fetch(url).then(r => r.json())
export const useEvents = (): { events: Event[] | undefined, error: string, isLoading: boolean } => {
  const { data, isLoading, error } = useSWR(`${basePath}/api/events`, eventsFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const events = data && 'events' in data ? data.events : undefined;
  return { events, error: errorString, isLoading }
}

// POST /api/events
export const postEvent = async (): Promise<Event> => {
  const apiPath = `${basePath}/api/events`
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
  };
  return fetch(apiPath, requestOptions).then(response => response.json()).then(data => {
    if ('error' in data) throw data.error
    if ('event' in data) return data.event
  })
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

function useSWR(arg0: string, eventsFetcher: (arg: string) => import("swr/_internal").FetcherResponse<import(".prisma/client").Event[]>): { data: any; isLoading: any; error: any } {
  throw new Error("Function not implemented.")
}
