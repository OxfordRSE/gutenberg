import prisma from "lib/prisma"

export async function isEventCoordinator(userEmail: string | undefined, eventId: number): Promise<boolean> {
  if (!userEmail || !Number.isInteger(eventId)) return false
  const row = await prisma.userOnEvent.findFirst({
    where: { userEmail, eventId, status: "COORDINATOR" },
  })
  return !!row
}

export async function isEventCoordinatorByGroup(userEmail: string | undefined, eventGroupId: number): Promise<boolean> {
  if (!userEmail || !Number.isInteger(eventGroupId)) return false
  const row = await prisma.userOnEvent.findFirst({
    where: { userEmail, status: "COORDINATOR", event: { EventGroup: { some: { id: eventGroupId } } } },
  })
  return !!row
}
