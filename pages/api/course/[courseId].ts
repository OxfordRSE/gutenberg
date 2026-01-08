import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"

export type CourseFull = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
    UserOnCourse: { include: { user: true } }
  }
}>

export type CourseGroup = Prisma.CourseGroupGetPayload<{
  include: { CourseItem: true }
}>

export type CourseItem = Prisma.CourseItemGetPayload<{}>

export type Data = {
  course?: CourseFull
  error?: string
}

const courseHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const userEmail = session.user?.email || undefined
  const currentUser = await prisma.user.findUnique({ where: { email: userEmail } })
  const isAdmin = !!currentUser?.admin
  const courseId = parseInt(req.query.courseId as string, 10)

  if (!courseId) {
    res.status(400).json({ error: "Invalid course id" })
    return
  }

  if (req.method === "GET") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        CourseGroup: { include: { CourseItem: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        CourseItem: { where: { groupId: null }, orderBy: { order: "asc" } },
        UserOnCourse: { include: { user: true } },
      },
    })

    if (!course) return res.status(404).json({ error: "Course not found" })

    if (!isAdmin) {
      course.UserOnCourse = course.UserOnCourse.filter((u) => u.userEmail === userEmail)
    }

    return res.status(200).json({ course })
  }

  if (req.method === "PUT") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })

    const courseData = req.body.course
    if (!courseData) return res.status(400).json({ error: "Missing course data" })

    const { name, summary, level, hidden, prerequisites, tags, outcomes } = courseData

    await prisma.course.update({
      where: { id: courseId },
      data: { name, summary, level, hidden: !!hidden, prerequisites, tags, outcomes },
    })

    const submittedGroups: CourseGroup[] = courseData.CourseGroup ?? []
    const existingGroups = await prisma.courseGroup.findMany({
      where: { courseId },
      select: { id: true },
    })
    const existingGroupIds = new Set(existingGroups.map((g) => g.id))
    const submittedGroupIds = new Set(submittedGroups.filter((g) => g.id).map((g) => g.id))
    const deletedGroupIds = [...existingGroupIds].filter((id) => !submittedGroupIds.has(id))

    if (deletedGroupIds.length > 0) {
      await prisma.courseGroup.deleteMany({ where: { id: { in: deletedGroupIds } } })
    }

    for (const group of submittedGroups) {
      const groupOrder = typeof group.order === "string" ? parseInt(group.order as unknown as string, 10) : group.order
      const groupItems: CourseItem[] = group.CourseItem ?? []

      if (group.id && existingGroupIds.has(group.id)) {
        await prisma.courseGroup.update({
          where: { id: group.id },
          data: {
            name: group.name,
            summary: group.summary,
            order: groupOrder ?? 0,
            CourseItem: {
              deleteMany: {},
              create: groupItems.map((item) => ({
                order: typeof item.order === "string" ? parseInt(item.order as unknown as string, 10) : item.order,
                section: item.section,
                course: { connect: { id: courseId } },
              })),
            },
          },
        })
      } else {
        await prisma.courseGroup.create({
          data: {
            name: group.name,
            summary: group.summary,
            order: groupOrder ?? 0,
            course: { connect: { id: courseId } },
            CourseItem: {
              create: groupItems.map((item) => ({
                order: typeof item.order === "string" ? parseInt(item.order as unknown as string, 10) : item.order,
                section: item.section,
                course: { connect: { id: courseId } },
              })),
            },
          },
        })
      }
    }

    const ungroupedItems: CourseItem[] = (courseData.CourseItem ?? []).filter((item: CourseItem) => !item.groupId)
    await prisma.courseItem.deleteMany({ where: { courseId, groupId: null } })
    if (ungroupedItems.length > 0) {
      await prisma.courseItem.createMany({
        data: ungroupedItems.map((item) => ({
          courseId,
          order: typeof item.order === "string" ? parseInt(item.order as unknown as string, 10) : item.order,
          section: item.section,
        })),
      })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        CourseGroup: { include: { CourseItem: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        CourseItem: { where: { groupId: null }, orderBy: { order: "asc" } },
        UserOnCourse: { include: { user: true } },
      },
    })

    if (!course) {
      res.status(404).json({ error: "Problem updating course, could not get from the database" })
      return
    }

    res.status(200).json({ course })
    return
  }

  if (req.method === "DELETE") {
    if (!isAdmin) return res.status(401).json({ error: "Unauthorized" })
    try {
      const course = await prisma.course.delete({
        where: { id: courseId },
        include: {
          CourseGroup: { include: { CourseItem: true } },
          CourseItem: true,
          UserOnCourse: { include: { user: true } },
        },
      })
      res.status(200).json({ course })
      return
    } catch (error) {
      res.status(500).json({ error: "Problem deleting course" })
      return
    }
  }

  res.status(405).json({ error: "Method not allowed" })
}

export default courseHandler
