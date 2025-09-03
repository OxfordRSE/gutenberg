import { Prisma } from "@prisma/client"

export type EventFull = Prisma.EventGetPayload<{
  include: { EventGroup: { include: { EventItem: true } } }
}>

export type Event = Prisma.EventGetPayload<{}>

export type EventGroup = Prisma.EventGroupGetPayload<{}>

export type Problem = Prisma.ProblemGetPayload<{}>

export type ProblemUpdate = Prisma.ProblemUpdateInput

export type UserOnEvent = Prisma.UserOnEventGetPayload<{}>

// TODO(ADW) The idea here is we have a frontend type that maps to but is not the backend type
// I have mentioned this before in various issues but here is an example of the implementation
// to be used in the problemviewmodal

// If we go down this route, we need to ensure that the frontend and backend types are kept in sync
// presumably via a programmatic approach.
export type ProblemForm = {
  tag: string
  section: string
  complete: boolean
  solution: string
  difficulty: number
  notes: string
}
