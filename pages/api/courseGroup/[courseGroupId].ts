import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"

export type CourseGroup = Prisma.CourseGroupGetPayload<{
  include: { CourseItem: true }
}>

export type CourseItem = Prisma.CourseItemGetPayload<{}>

export type Data = {
  courseGroup?: CourseGroup
  error?: string
}

const courseGroupHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const userEmail = session.user?.email || undefined
  const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
  const isAdmin = currentUser?.admin

  const courseGroupId = req.query.courseGroupId as string

  if (req.method === "GET") {
    const courseGroup = await prisma.courseGroup.findUnique({
      where: { id: parseInt(courseGroupId, 10) },
      include: { CourseItem: { orderBy: { order: "asc" } } },
    })

    if (!courseGroup) {
      res.status(404).json({ error: "CourseGroup not found" })
      return
    }

    res.status(200).json({ courseGroup })
    return
  }

  if (req.method === "PUT") {
    const { name, summary, order } = req.body.courseGroup
    const courseItemData: CourseItem[] = req.body.courseGroup.CourseItem ?? []

    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const existingGroup = await prisma.courseGroup.findUnique({
      where: { id: parseInt(courseGroupId, 10) },
      select: { courseId: true },
    })
    if (!existingGroup) {
      res.status(404).json({ error: "CourseGroup not found" })
      return
    }

    courseItemData.forEach((courseItem) => {
      if (typeof courseItem.order === "string") {
        courseItem.order = parseInt(courseItem.order as unknown as string, 10)
      }
    })

    const updatedCourseGroup = await prisma.courseGroup.update({
      where: { id: parseInt(courseGroupId, 10) },
      data: {
        name,
        summary,
        order: typeof order === "string" ? parseInt(order as unknown as string, 10) : order,
        CourseItem: {
          deleteMany: {},
          create: courseItemData.map((courseItem) => ({
            ...courseItem,
            id: undefined,
            groupId: undefined,
            courseId: undefined,
            course: { connect: { id: existingGroup.courseId } },
          })),
        },
      },
      include: { CourseItem: { orderBy: { order: "asc" } } },
    })

    if (!updatedCourseGroup) {
      res.status(404).json({ error: "Problem updating courseGroup, could not get from dbase" })
      return
    }
    res.status(200).json({ courseGroup: updatedCourseGroup })
    return
  }

  if (req.method === "DELETE") {
    if (!isAdmin) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const deletedCourseGroup = await prisma.courseGroup.delete({
      where: { id: parseInt(courseGroupId, 10) },
      include: { CourseItem: { orderBy: { order: "asc" } } },
    })
    res.status(200).json({ courseGroup: deletedCourseGroup })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}

export default courseGroupHandler
