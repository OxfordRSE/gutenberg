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
  try {
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

      // Seed inserts explicit Course IDs, which can leave the sequence behind and cause unique ID conflicts.
      // If we hit P2002 on create, reset the Course ID sequence to the current max before retrying.
      const resetCourseSequence = async () => {
        await prisma.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('"Course"', 'id'),
            COALESCE((SELECT MAX(id) FROM "Course"), 1),
            true
          );
        `
      }

      const createCourse = async (data: Prisma.CourseCreateInput) => {
        return prisma.course.create({
          data,
          include: { UserOnCourse: { select: userOnCourseSelect } },
        })
      }

      if (!req.body) {
        try {
          const course = await createCourse({})
          res.status(201).json({ course })
          return
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            await resetCourseSequence()
            const course = await createCourse({})
            res.status(201).json({ course })
            return
          }
          throw error
        }
      }

      const { externalId, name, summary, level, hidden, language, prerequisites, tags, outcomes } = req.body
      const trimmedName = typeof name === "string" ? name.trim() : ""
      const trimmedSummary = typeof summary === "string" ? summary.trim() : ""
      const trimmedLevel = typeof level === "string" ? level.trim() : ""
      if (!trimmedName) {
        res.status(400).json({ error: "A name is required." })
        return
      }
      if (!trimmedSummary) {
        res.status(400).json({ error: "A summary is required." })
        return
      }
      if (!trimmedLevel) {
        res.status(400).json({ error: "A level is required." })
        return
      }
      const slugifyExternalId = (value: string) => {
        return value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
      }

      const resolveExternalId = async () => {
        if (externalId && typeof externalId === "string" && externalId.trim().length > 0) {
          return externalId.trim()
        }

        const base = slugifyExternalId(trimmedName || "course")
        let candidate = base || "course"
        let suffix = 1
        // Ensure uniqueness by appending _2, _3, ...
        while (await prisma.course.findUnique({ where: { externalId: candidate }, select: { id: true } })) {
          suffix += 1
          candidate = `${base || "course"}_${suffix}`
        }
        return candidate
      }

      const resolvedExternalId = await resolveExternalId()
      try {
        const course = resolvedExternalId
          ? await prisma.course.upsert({
              where: { externalId: resolvedExternalId },
              update: {
                name,
                summary,
                level,
                hidden: !!hidden,
                language,
                prerequisites,
                tags,
                outcomes,
              },
              create: {
                externalId: resolvedExternalId,
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
          : await createCourse({
              name,
              summary,
              level,
              hidden: !!hidden,
              language,
              prerequisites,
              tags,
              outcomes,
            })
        res.status(201).json({ course })
        return
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          if (resolvedExternalId) {
            const course = await prisma.course.findUnique({
              where: { externalId: resolvedExternalId },
              include: { UserOnCourse: { select: userOnCourseSelect } },
            })
            if (course) {
              res.status(200).json({ course })
              return
            }
          }
          await resetCourseSequence()
          const course = await createCourse({
            name,
            summary,
            level,
            hidden: !!hidden,
            language,
            prerequisites,
            tags,
            outcomes,
          })
          res.status(201).json({ course })
          return
        }
        throw error
      }
    }

    if (req.method === "GET") {
      const session = await getServerSession(req, res, authOptions)
      const userEmail = session?.user?.email || undefined
      const currentUser = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
      const isAdmin = currentUser?.admin

      if (!userEmail) {
        const courses = await prisma.course.findMany({
          where: isAdmin ? {} : { hidden: false },
        })
        const publicCourses = courses.map((course) => ({ ...course, UserOnCourse: [] }))
        res.status(200).json({ courses: sortCourses(publicCourses) })
        return
      }

      const courses = await prisma.course.findMany({
        where: isAdmin ? {} : { hidden: false },
        include: {
          UserOnCourse: {
            where: { userEmail },
            select: userOnCourseSelect,
          },
        },
      })
      res.status(200).json({ courses: sortCourses(courses) })
      return
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    res.status(500).json({ error: message })
  }
}

export default Courses
