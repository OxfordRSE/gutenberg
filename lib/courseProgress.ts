import { Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { getMaterial, sectionSplit } from "lib/material"
import type { SectionProgress } from "pages/api/course/[courseId]/progress"

type CourseWithItems = Prisma.CourseGetPayload<{
  include: { CourseItem: true; CourseGroup: { include: { CourseItem: true } } }
}>

export type CourseProgress = { total: number; completed: number; sections: SectionProgress[] }

export async function calculateCourseProgress(
  userEmail: string,
  courses: CourseWithItems[]
): Promise<Record<number, CourseProgress>> {
  if (courses.length === 0) return {}

  const courseSections = new Map<number, string[]>()

  for (const course of courses) {
    const groupedItems = course.CourseGroup.flatMap((group) => group.CourseItem)
    const allItems = [...course.CourseItem, ...groupedItems]
    const sections = allItems.map((item) => item.section).filter((section) => section.length > 0)
    courseSections.set(course.id, Array.from(new Set(sections)))
  }

  const allSections = Array.from(new Set(Array.from(courseSections.values()).flat()))
  if (allSections.length === 0) {
    return Object.fromEntries(
      courses.map((course) => [course.id, { total: 0, completed: 0, sections: [] satisfies SectionProgress[] }])
    )
  }

  const material = await getMaterial(true)
  const sectionProblemMap = new Map<string, Set<string>>()
  for (const sectionRef of allSections) {
    const { section } = sectionSplit(sectionRef, material)
    if (!section?.problems?.length) continue
    sectionProblemMap.set(sectionRef, new Set(section.problems))
  }

  const problems = await prisma.problem.findMany({
    where: { userEmail, section: { in: allSections } },
    select: { complete: true, section: true, tag: true },
  })

  const completedBySection = problems.reduce<Record<string, number>>((acc, problem) => {
    if (!problem.complete) return acc
    const sectionTags = sectionProblemMap.get(problem.section)
    if (!sectionTags || !sectionTags.has(problem.tag)) return acc
    acc[problem.section] = (acc[problem.section] || 0) + 1
    return acc
  }, {})

  const progressByCourseId: Record<number, CourseProgress> = {}

  for (const course of courses) {
    const uniqueSections = courseSections.get(course.id) ?? []
    const sectionsProgress = uniqueSections.map((section) => ({
      section,
      total: sectionProblemMap.get(section)?.size ?? 0,
      completed: completedBySection[section] ?? 0,
    }))
    const total = sectionsProgress.reduce((sum, entry) => sum + entry.total, 0)
    const completed = sectionsProgress.reduce((sum, entry) => sum + entry.completed, 0)

    progressByCourseId[course.id] = {
      total,
      completed,
      sections: sectionsProgress,
    }
  }

  return progressByCourseId
}
