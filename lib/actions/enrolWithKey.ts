// lib/actions/enrolWithKey.ts
import { EventStatus } from "@prisma/client"

export type PublicUserOnEvent = {
  id: string
  eventId: number
  userEmail: string
  status: EventStatus
}

export default async function enrolWithKey(
  eventId: number,
  enrolKey?: string
): Promise<{ userOnEvent?: PublicUserOnEvent; error?: string }> {
  const res = await fetch(`/api/event/${eventId}/enrol`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrolKey }),
  })

  return res.json()
}
