import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { sortCourses } from "lib/courseSort"

const userOnCourseSelect = {
  courseId: true,
  userEmail: true,
  status: true,
  startedAt: true,
  completedAt: true,
} as const

export type Course = Prisma.CourseGetPayload<{
  include: { UserOnCourse: { select: typeof userOnCourseSelect } }
}>

export type Data = {
  courses?: Course[]
  course?: Course
  error?: string
}

const Courses = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const userEmail = session.user?.email || undefined
    const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
    const isAdmin = currentUser?.admin

    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!req.body) {
      const course = await prisma.course.create({
        data: {},
        include: { UserOnCourse: { select: userOnCourseSelect } },
      })
      res.status(201).json({ course })
      return
    }

    const { name, summary, level, hidden, language, prerequisites, tags, outcomes } = req.body
    const course = await prisma.course.create({
      data: {
        name,
        summary,
        level,
        hidden: !!hidden,
        language,
        prerequisites,
        tags,
        outcomes,
      },
      include: { UserOnCourse: { select: userOnCourseSelect } },
    })
    res.status(201).json({ course })
    return
  }

  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions)
    const userEmail = session?.user?.email || undefined
    const currentUser = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
    const isAdmin = currentUser?.admin

    const courses = await prisma.course.findMany({
      where: isAdmin ? {} : { hidden: false },
      include: {
        UserOnCourse: {
          where: userEmail ? { userEmail } : undefined,
          select: userOnCourseSelect,
        },
      },
    })
    res.status(200).json({ courses: sortCourses(courses) })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}

export default Courses
