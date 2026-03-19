import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "lib/prisma"
import { calculateCourseProgress } from "lib/courseProgress"

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

  const progressByCourseId = await calculateCourseProgress(userEmail, [course])
  const progress = progressByCourseId[courseId] ?? { total: 0, completed: 0, sections: [] }
  const { total, completed, sections: sectionsProgress } = progress

  if (total > 0 && completed >= total) {
    const current = await prisma.userOnCourse.findUnique({
      where: { userEmail_courseId: { userEmail, courseId } },
      select: { status: true, completedAt: true },
    })
    if (current && current.status !== "COMPLETED") {
      await prisma.userOnCourse.update({
        where: { userEmail_courseId: { userEmail, courseId } },
        data: { status: "COMPLETED", completedAt: current.completedAt ?? new Date() },
      })
    }
  }

  res.status(200).json({ total, completed, sections: sectionsProgress })
}

export default progressHandler
