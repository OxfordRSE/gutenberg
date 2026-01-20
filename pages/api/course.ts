import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { sortCourses } from "lib/courseSort"

export type Course = Prisma.CourseGetPayload<{}>

export type Data = {
  courses?: Course[]
  course?: Course
  error?: string
}

const Courses = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined
  const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
  const isAdmin = currentUser?.admin

  if (req.method === "POST") {
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    if (!req.body) {
      const course = await prisma.course.create({ data: {} })
      res.status(201).json({ course })
      return
    }

    const { name, summary, level, hidden, languages, prerequisites, tags, outcomes } = req.body
    const course = await prisma.course.create({
      data: {
        name,
        summary,
        level,
        hidden: !!hidden,
        languages,
        prerequisites,
        tags,
        outcomes,
      },
    })
    res.status(201).json({ course })
    return
  }

  if (req.method === "GET") {
    const courses = await prisma.course.findMany({
      where: isAdmin ? {} : { hidden: false },
    })
    res.status(200).json({ courses: sortCourses(courses) })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}

export default Courses
