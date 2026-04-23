import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"
import { calculateCourseProgress, CourseProgress } from "lib/courseProgress"
import { CourseStatus } from "@prisma/client"

import type { NextApiRequest, NextApiResponse } from "next"

export type Data =
  | {
      progressByCourseId: Record<number, CourseProgress>
    }
  | { error: string }

const myProgressHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

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

  const courses = await prisma.course.findMany({
    where: {
      UserOnCourse: {
        some: {
          userEmail,
          status: { in: [CourseStatus.ENROLLED, CourseStatus.COMPLETED] },
        },
      },
    },
    include: {
      CourseItem: true,
      CourseGroup: { include: { CourseItem: true } },
      UserOnCourse: {
        where: { userEmail },
        select: { status: true, completedAt: true },
      },
    },
  })

  const progressByCourseId = await calculateCourseProgress(userEmail, courses)

  for (const course of courses) {
    const progress = progressByCourseId[course.id]
    const enrolment = course.UserOnCourse[0]
    if (!progress || !enrolment) continue
    if (progress.total > 0 && progress.completed >= progress.total && enrolment.status !== CourseStatus.COMPLETED) {
      await prisma.userOnCourse.update({
        where: { userEmail_courseId: { userEmail, courseId: course.id } },
        data: { status: CourseStatus.COMPLETED, completedAt: enrolment.completedAt ?? new Date() },
      })
    }
  }

  res.status(200).json({ progressByCourseId })
}

export default myProgressHandler
