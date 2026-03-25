import { EventStatus, Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { getMaterial, sectionSplit } from "lib/material"
import { mean, percent, round } from "lib/stats"

export const eventStatsInclude = {
  EventGroup: { include: { EventItem: true } },
  UserOnEvent: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
} as const

export type EventForStats = Prisma.EventGetPayload<{ include: typeof eventStatsInclude }>

export type EventLearnerStats = {
  userEmail: string
  userName: string | null
  status: EventStatus
  totalProblems: number
  completedProblems: number
  completionPercent: number | null
}

export type EventSectionStats = {
  sectionRef: string
  title: string
  url: string | null
  totalProblems: number
  averageCompletionPercent: number | null
  fullyCompletedLearners: number
}

export type EventStats = {
  eventId: number
  name: string
  hidden: boolean
  start: Date
  end: Date
  groupCount: number
  itemCount: number
  studentCount: number
  instructorCount: number
  requestCount: number
  rejectedCount: number
  trackableProblems: number
  averageProgressPercent: number | null
  learnerStats: EventLearnerStats[]
  sectionStats: EventSectionStats[]
}

export type EventStatsOverview = {
  totalEvents: number
  visibleEvents: number
  totalStudents: number
  totalInstructors: number
  totalRequests: number
  averageStudentsPerEvent: number | null
  averageProgressPercent: number | null
  mostPopularEvent: { name: string; studentCount: number } | null
}

function uniqueEventSections(event: EventForStats): string[] {
  return Array.from(
    new Set(event.EventGroup.flatMap((group) => group.EventItem.map((item) => item.section)).filter(Boolean))
  )
}

export async function calculateEventStats(events: EventForStats[]): Promise<EventStats[]> {
  if (events.length === 0) return []

  const eventSections = new Map<number, string[]>()
  for (const event of events) {
    eventSections.set(event.id, uniqueEventSections(event))
  }

  const allSections = Array.from(new Set(Array.from(eventSections.values()).flat()))
  const studentEmails = Array.from(
    new Set(
      events.flatMap((event) =>
        event.UserOnEvent.filter((entry) => entry.status === EventStatus.STUDENT).map((entry) => entry.userEmail)
      )
    )
  )

  const material = await getMaterial(true)
  const sectionProblemMap = new Map<string, Set<string>>()
  const sectionMeta = new Map<string, { title: string; url: string | null }>()
  for (const sectionRef of allSections) {
    const { section, url } = sectionSplit(sectionRef, material)
    sectionProblemMap.set(sectionRef, new Set(section?.problems ?? []))
    sectionMeta.set(sectionRef, { title: section?.name || sectionRef, url: url ?? null })
  }

  const problems =
    allSections.length > 0 && studentEmails.length > 0
      ? await prisma.problem.findMany({
          where: {
            userEmail: { in: studentEmails },
            section: { in: allSections },
          },
          select: { userEmail: true, section: true, tag: true, complete: true },
        })
      : []

  const completedByUserSection = new Map<string, number>()
  for (const problem of problems) {
    if (!problem.complete) continue
    const sectionTags = sectionProblemMap.get(problem.section)
    if (!sectionTags || !sectionTags.has(problem.tag)) continue
    const key = `${problem.userEmail}::${problem.section}`
    completedByUserSection.set(key, (completedByUserSection.get(key) ?? 0) + 1)
  }

  return events.map((event) => {
    const sections = eventSections.get(event.id) ?? []
    const trackableProblems = sections.reduce(
      (sum, sectionRef) => sum + (sectionProblemMap.get(sectionRef)?.size ?? 0),
      0
    )
    const students = event.UserOnEvent.filter((entry) => entry.status === EventStatus.STUDENT)
    const learnerStats = event.UserOnEvent.map((entry) => {
      const totalProblems = entry.status === EventStatus.STUDENT ? trackableProblems : 0
      const completedProblems =
        entry.status === EventStatus.STUDENT
          ? sections.reduce(
              (sum, sectionRef) => sum + (completedByUserSection.get(`${entry.userEmail}::${sectionRef}`) ?? 0),
              0
            )
          : 0

      return {
        userEmail: entry.userEmail,
        userName: entry.user?.name ?? null,
        status: entry.status,
        totalProblems,
        completedProblems,
        completionPercent:
          entry.status === EventStatus.STUDENT ? round(percent(completedProblems, totalProblems)) : null,
      }
    })

    const studentProgress = learnerStats
      .filter((learner) => learner.status === EventStatus.STUDENT)
      .map((learner) => learner.completionPercent)
      .filter((value): value is number => value !== null)

    const sectionStats = sections.map((sectionRef) => {
      const totalProblems = sectionProblemMap.get(sectionRef)?.size ?? 0
      const completions = students.map((student) => {
        const completed = completedByUserSection.get(`${student.userEmail}::${sectionRef}`) ?? 0
        return totalProblems > 0 ? (completed / totalProblems) * 100 : null
      })
      const usable = completions.filter((value): value is number => value !== null)
      return {
        sectionRef,
        title: sectionMeta.get(sectionRef)?.title ?? sectionRef,
        url: sectionMeta.get(sectionRef)?.url ?? null,
        totalProblems,
        averageCompletionPercent: round(mean(usable)),
        fullyCompletedLearners: usable.filter((value) => value >= 100).length,
      }
    })

    return {
      eventId: event.id,
      name: event.name,
      hidden: event.hidden,
      start: new Date(event.start),
      end: new Date(event.end),
      groupCount: event.EventGroup.length,
      itemCount: event.EventGroup.reduce((sum, group) => sum + group.EventItem.length, 0),
      studentCount: event.UserOnEvent.filter((entry) => entry.status === EventStatus.STUDENT).length,
      instructorCount: event.UserOnEvent.filter((entry) => entry.status === EventStatus.INSTRUCTOR).length,
      requestCount: event.UserOnEvent.filter((entry) => entry.status === EventStatus.REQUEST).length,
      rejectedCount: event.UserOnEvent.filter((entry) => entry.status === EventStatus.REJECTED).length,
      trackableProblems,
      averageProgressPercent: round(mean(studentProgress)),
      learnerStats,
      sectionStats,
    }
  })
}

export function summarizeEventStats(eventStats: EventStats[]): EventStatsOverview {
  const progressPercents = eventStats
    .flatMap((event) => event.learnerStats)
    .filter((learner) => learner.status === EventStatus.STUDENT)
    .map((learner) => learner.completionPercent)
    .filter((value): value is number => value !== null)

  const totalEvents = eventStats.length
  const visibleEvents = eventStats.filter((event) => !event.hidden).length
  const totalStudents = eventStats.reduce((sum, event) => sum + event.studentCount, 0)
  const totalInstructors = eventStats.reduce((sum, event) => sum + event.instructorCount, 0)
  const totalRequests = eventStats.reduce((sum, event) => sum + event.requestCount, 0)
  const mostPopularEvent =
    eventStats.length === 0
      ? null
      : [...eventStats].sort((a, b) => b.studentCount - a.studentCount || a.name.localeCompare(b.name))[0]

  return {
    totalEvents,
    visibleEvents,
    totalStudents,
    totalInstructors,
    totalRequests,
    averageStudentsPerEvent: round(mean(eventStats.map((event) => event.studentCount))),
    averageProgressPercent: round(mean(progressPercents)),
    mostPopularEvent: mostPopularEvent
      ? { name: mostPopularEvent.name, studentCount: mostPopularEvent.studentCount }
      : null,
  }
}
