import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "lib/prisma"
import { getMaterial, sectionSplit } from "lib/material"

import type { NextApiRequest, NextApiResponse } from "next"

export type SectionProgress = { section: string; total: number; completed: number }
export type Data = { total: number; completed: number; sections: SectionProgress[] } | { error: string }

const progressHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email
  if (!userEmail) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const courseId = parseInt(req.query.courseId as string, 10)
  if (!courseId) {
    res.status(400).json({ error: "Invalid course id" })
    return
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { CourseItem: true, CourseGroup: { include: { CourseItem: true } } },
  })

  if (!course) {
    res.status(404).json({ error: "Course not found" })
    return
  }

  const groupedItems = course.CourseGroup.flatMap((group) => group.CourseItem)
  const allItems = [...course.CourseItem, ...groupedItems]
  const sections = allItems.map((item) => item.section).filter((section) => section.length > 0)
  const uniqueSections = Array.from(new Set(sections))

  if (uniqueSections.length === 0) {
    res.status(200).json({ total: 0, completed: 0, sections: [] })
    return
  }

  const material = await getMaterial(true)
  const sectionProblemMap = new Map<string, Set<string>>()
  for (const sectionRef of uniqueSections) {
    const { section } = sectionSplit(sectionRef, material)
    if (!section?.problems?.length) continue
    sectionProblemMap.set(sectionRef, new Set(section.problems))
  }

  const total = Array.from(sectionProblemMap.values()).reduce((sum, tags) => sum + tags.size, 0)
  if (total === 0) {
    res.status(200).json({
      total: 0,
      completed: 0,
      sections: uniqueSections.map((section) => ({ section, total: 0, completed: 0 })),
    })
    return
  }

  const problems = await prisma.problem.findMany({
    where: { userEmail, section: { in: uniqueSections } },
    select: { complete: true, section: true, tag: true },
  })

  const completedProblems = problems.filter((problem) => {
    if (!problem.complete) return false
    const sectionTags = sectionProblemMap.get(problem.section)
    if (!sectionTags) return false
    return sectionTags.has(problem.tag)
  })

  const completedBySection = completedProblems.reduce<Record<string, number>>((acc, problem) => {
    acc[problem.section] = (acc[problem.section] || 0) + 1
    return acc
  }, {})

  const sectionsProgress = uniqueSections.map((section) => {
    const totalForSection = sectionProblemMap.get(section)?.size ?? 0
    return {
      section,
      total: totalForSection,
      completed: completedBySection[section] ?? 0,
    }
  })

  const completed = sectionsProgress.reduce((sum, entry) => sum + entry.completed, 0)

  res.status(200).json({ total, completed, sections: sectionsProgress })
}

export default progressHandler
