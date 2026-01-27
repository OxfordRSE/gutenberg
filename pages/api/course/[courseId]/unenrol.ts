import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "lib/prisma"
import { CourseStatus, Prisma } from "@prisma/client"

import type { NextApiRequest, NextApiResponse } from "next"

const userOnCourseSelect = {
  courseId: true,
  userEmail: true,
  status: true,
  startedAt: true,
  completedAt: true,
} as const
type PublicUserOnCourse = Prisma.UserOnCourseGetPayload<{ select: typeof userOnCourseSelect }>

type Data =
  | {
      userOnCourse: {
        id: string
        courseId: number
        userEmail: string
        status: CourseStatus
        startedAt: Date
        completedAt: Date | null
      }
    }
  | { error: string }

const unenrolHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const existing = await prisma.userOnCourse.findUnique({
    where: { userEmail_courseId: { userEmail, courseId } },
    select: { courseId: true },
  })
  if (!existing) {
    res.status(404).json({ error: "Enrollment not found" })
    return
  }

  const updated: PublicUserOnCourse = await prisma.userOnCourse.update({
    where: { userEmail_courseId: { userEmail, courseId } },
    data: { status: CourseStatus.DROPPED, completedAt: null },
    select: userOnCourseSelect,
  })

  const syntheticId = `${updated.userEmail}:${updated.courseId}`
  res.status(200).json({
    userOnCourse: {
      id: syntheticId,
      courseId: updated.courseId,
      userEmail: updated.userEmail,
      status: updated.status,
      startedAt: updated.startedAt,
      completedAt: updated.completedAt,
    },
  })
}

export default unenrolHandler
