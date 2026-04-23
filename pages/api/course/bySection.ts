import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { Prisma } from "@prisma/client"
import prisma from "lib/prisma"
import { authOptions } from "../auth/[...nextauth]"

const userOnCourseSelect = {
  courseId: true,
  userEmail: true,
  status: true,
  startedAt: true,
  completedAt: true,
} as const

export type CourseBySection = Prisma.CourseGetPayload<{
  select: {
    id: true
    externalId: true
    name: true
    UserOnCourse: { select: typeof userOnCourseSelect }
  }
}>

export type Data = {
  courses?: CourseBySection[]
  error?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const section = typeof req.query.section === "string" ? req.query.section.trim() : ""
  if (!section) {
    res.status(400).json({ error: "A section is required." })
    return
  }

  const session = await getServerSession(req, res, authOptions)
  const userEmail = session?.user?.email ?? "__anonymous__"

  const courses = await prisma.course.findMany({
    where: {
      hidden: false,
      OR: [{ CourseItem: { some: { section } } }, { CourseGroup: { some: { CourseItem: { some: { section } } } } }],
    },
    select: {
      id: true,
      externalId: true,
      name: true,
      UserOnCourse: {
        where: { userEmail },
        select: userOnCourseSelect,
      },
    },
    orderBy: { name: "asc" },
  })

  res.status(200).json({ courses })
}

export default handler
