import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { EventFull } from "lib/types"
import prisma from 'lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'
import useSWR, { Fetcher, KeyedMutator } from "swr"
import { basePath } from "lib/basePath"

type Data = {
  events?: EventFull[],
  error?: string,
}

const myEventsFetcher: Fetcher<Data, string> = url => fetch(url).then(r => r.json())

// hook that gets my events
export const useMyEvents = (): { events: EventFull[] | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<Data> } => {
  const { data, error, isLoading, mutate } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const events = data && 'events' in data ? data.events : undefined;
  return { events, error: errorString, isLoading, mutate}
}

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
      include: { EventGroup: { orderBy: { start: "asc" }, include: { EventItem: { orderBy: { order: "asc" } } } } },
      orderBy: { start: "asc" } 
    });
  }
  res.status(200).json(events)
}

export default EventsFull