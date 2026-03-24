import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { authOptions } from "../../auth/[...nextauth]"

const userOnCourseSelect = {
  courseId: true,
  userEmail: true,
  status: true,
  startedAt: true,
  completedAt: true,
} as const

export type CourseByExternal = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
    UserOnCourse: { select: typeof userOnCourseSelect }
  }
}>

export type Data = {
  course?: CourseByExternal
  error?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const externalId = typeof req.query.externalId === "string" ? req.query.externalId.trim() : ""
  if (!externalId) {
    res.status(400).json({ error: "An externalId is required." })
    return
  }

  const userEmail = session.user?.email || undefined
  const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
  const isAdmin = !!currentUser?.admin

  const course = await prisma.course.findUnique({
    where: { externalId },
    include: {
      CourseGroup: { include: { CourseItem: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      CourseItem: { where: { groupId: null }, orderBy: { order: "asc" } },
      UserOnCourse: { select: userOnCourseSelect },
    },
  })

  if (!course || (course.hidden && !isAdmin)) {
    res.status(404).json({ error: "Course not found" })
    return
  }

  if (!isAdmin) {
    course.UserOnCourse = course.UserOnCourse.filter((u) => u.userEmail === userEmail)
  }

  res.status(200).json({ course })
}

export default handler
