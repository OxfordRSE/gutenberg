import { Prisma } from "@prisma/client";

export type Event = Prisma.EventGetPayload<{
    include: { EventGroup: { include: { EventItem: true } }},
}>