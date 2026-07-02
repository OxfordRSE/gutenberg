import { CourseStatus, Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { getMaterial, sectionSplit } from "lib/material"
import {
  emptyProgressBandCounts,
  getProgressBand,
  type ProgressBandCounts,
  type ProgressBandKey,
} from "lib/progressBands"
import { differenceInDays, mean, median, percent, round } from "lib/stats"

export const courseStatsInclude = {
  CourseItem: true,
  CourseGroup: { include: { CourseItem: true } },
  UserOnCourse: {
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

export type CourseForStats = Prisma.CourseGetPayload<{ include: typeof courseStatsInclude }>

export type ProgressBands = ProgressBandCounts

export type LearnerCourseStats = {
  userEmail: string
  userName: string | null
  status: CourseStatus
  startedAt: Date
  completedAt: Date | null
  totalProblems: number
  completedProblems: number
  completionPercent: number | null
  progressBand: ProgressBandKey
  completionDays: number | null
}

export type SectionCourseStats = {
  sectionRef: string
  title: string
  url: string | null
  totalProblems: number
  learnerCount: number
  averageCompletionPercent: number | null
  fullyCompletedLearners: number
}

export type CourseStats = {
  courseId: number
  externalId: string
  name: string
  level: string
  hidden: boolean
  trackableProblems: number
  totalLearners: number
  enrolledCount: number
  completedCount: number
  droppedCount: number
  completionRate: number | null
  averageCompletionDays: number | null
  medianCompletionDays: number | null
  averageProgressPercent: number | null
  progressBands: ProgressBands
  learners: LearnerCourseStats[]
  sections: SectionCourseStats[]
}

export type CourseStatsOverview = {
  totalCourses: number
  totalLearners: number
  totalEnrolled: number
  totalCompleted: number
  totalDropped: number
  overallCompletionRate: number | null
  averageCompletionDays: number | null
  averageProgressPercent: number | null
  trackableCourses: number
  mostPopularCourse: { name: string; totalPeople: number } | null
}

function uniqueCourseSections(course: CourseForStats): string[] {
  type CourseGroupWithItems = CourseForStats["CourseGroup"][number]
  type CourseItem = CourseForStats["CourseItem"][number]

  const groupedItems = course.CourseGroup.flatMap((group: CourseGroupWithItems) => group.CourseItem)
  const allItems = [...course.CourseItem, ...groupedItems]
  return Array.from(new Set(allItems.map((item: CourseItem) => item.section).filter(Boolean)))
}

export async function calculateCourseStats(courses: CourseForStats[]): Promise<CourseStats[]> {
  type Enrolment = CourseForStats["UserOnCourse"][number]

  if (courses.length === 0) return []

  const courseSections = new Map<number, string[]>()
  for (const course of courses) {
    courseSections.set(course.id, uniqueCourseSections(course))
  }

  const allSections = Array.from(new Set(Array.from(courseSections.values()).flat()))
  const allUserEmails = Array.from(
    new Set(courses.flatMap((course) => course.UserOnCourse.map((enrolment: Enrolment) => enrolment.userEmail)))
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
    allSections.length > 0 && allUserEmails.length > 0
      ? await prisma.problem.findMany({
          where: {
            userEmail: { in: allUserEmails },
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

  return courses.map((course) => {
    const sections = courseSections.get(course.id) ?? []
    const trackableProblems = sections.reduce(
      (sum, sectionRef) => sum + (sectionProblemMap.get(sectionRef)?.size ?? 0),
      0
    )
    const learners = course.UserOnCourse.map((enrolment: Enrolment) => {
      const totalProblems = trackableProblems
      const completedProblems = sections.reduce(
        (sum, sectionRef) => sum + (completedByUserSection.get(`${enrolment.userEmail}::${sectionRef}`) ?? 0),
        0
      )
      const isCompleted = enrolment.status === CourseStatus.COMPLETED
      const completionPercent = isCompleted ? 100 : round(percent(completedProblems, totalProblems))
      const completionDays =
        isCompleted && enrolment.completedAt
          ? round(differenceInDays(new Date(enrolment.startedAt), new Date(enrolment.completedAt)))
          : null

      return {
        userEmail: enrolment.userEmail,
        userName: enrolment.user?.name ?? null,
        status: enrolment.status,
        startedAt: new Date(enrolment.startedAt),
        completedAt: enrolment.completedAt ? new Date(enrolment.completedAt) : null,
        totalProblems,
        completedProblems,
        completionPercent,
        progressBand: getProgressBand(completionPercent, totalProblems),
        completionDays,
      }
    })

    const progressBands = learners.reduce<ProgressBands>((acc: ProgressBands, learner: LearnerCourseStats) => {
      acc[learner.progressBand] += 1
      return acc
    }, emptyProgressBandCounts())

    const completionDays = learners
      .map((learner: LearnerCourseStats) => learner.completionDays)
      .filter((value: number | null): value is number => value !== null)
    const progressPercents = learners
      .map((learner: LearnerCourseStats) => learner.completionPercent)
      .filter((value: number | null): value is number => value !== null)

    const sectionsStats = sections.map((sectionRef) => {
      const totalProblems = sectionProblemMap.get(sectionRef)?.size ?? 0
      const perLearner = learners.map((learner: LearnerCourseStats) => {
        const completed = completedByUserSection.get(`${learner.userEmail}::${sectionRef}`) ?? 0
        return totalProblems > 0 ? (completed / totalProblems) * 100 : null
      })
      const usable = perLearner.filter((value: number | null): value is number => value !== null)
      return {
        sectionRef,
        title: sectionMeta.get(sectionRef)?.title ?? sectionRef,
        url: sectionMeta.get(sectionRef)?.url ?? null,
        totalProblems,
        learnerCount: learners.length,
        averageCompletionPercent: round(mean(usable)),
        fullyCompletedLearners: usable.filter((value: number) => value >= 100).length,
      }
    })

    const totalLearners = learners.length
    const enrolledCount = learners.filter(
      (learner: LearnerCourseStats) => learner.status === CourseStatus.ENROLLED
    ).length
    const completedCount = learners.filter(
      (learner: LearnerCourseStats) => learner.status === CourseStatus.COMPLETED
    ).length
    const droppedCount = learners.filter(
      (learner: LearnerCourseStats) => learner.status === CourseStatus.DROPPED
    ).length

    return {
      courseId: course.id,
      externalId: course.externalId,
      name: course.name,
      level: course.level,
      hidden: course.hidden,
      trackableProblems,
      totalLearners,
      enrolledCount,
      completedCount,
      droppedCount,
      completionRate: round(percent(completedCount, totalLearners)),
      averageCompletionDays: round(mean(completionDays)),
      medianCompletionDays: round(median(completionDays)),
      averageProgressPercent: round(mean(progressPercents)),
      progressBands,
      learners,
      sections: sectionsStats,
    }
  })
}

export function summarizeCourseStats(courseStats: CourseStats[]): CourseStatsOverview {
  const completionDays = courseStats.flatMap((course) =>
    course.learners.map((learner) => learner.completionDays).filter((value): value is number => value !== null)
  )
  const progressPercents = courseStats.flatMap((course) =>
    course.learners.map((learner) => learner.completionPercent).filter((value): value is number => value !== null)
  )

  const totalCourses = courseStats.length
  const totalLearners = courseStats.reduce((sum, course) => sum + course.totalLearners, 0)
  const totalEnrolled = courseStats.reduce((sum, course) => sum + course.enrolledCount, 0)
  const totalCompleted = courseStats.reduce((sum, course) => sum + course.completedCount, 0)
  const totalDropped = courseStats.reduce((sum, course) => sum + course.droppedCount, 0)
  const trackableCourses = courseStats.filter((course) => course.trackableProblems > 0).length
  const mostPopularCourse =
    courseStats.length === 0
      ? null
      : [...courseStats].sort((a, b) => b.totalLearners - a.totalLearners || a.name.localeCompare(b.name))[0]

  return {
    totalCourses,
    totalLearners,
    totalEnrolled,
    totalCompleted,
    totalDropped,
    overallCompletionRate: round(percent(totalCompleted, totalLearners)),
    averageCompletionDays: round(mean(completionDays)),
    averageProgressPercent: round(mean(progressPercents)),
    trackableCourses,
    mostPopularCourse: mostPopularCourse
      ? { name: mostPopularCourse.name, totalPeople: mostPopularCourse.totalLearners }
      : null,
  }
}
