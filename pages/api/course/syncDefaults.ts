import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"
import { readFile } from "fs/promises"
import path from "path"
import { CourseJsonInput, normalizeCourseJson } from "lib/courseJson"
import { reviewCourseDefaults, type CourseSyncReview } from "lib/courseSync"

import type { NextApiRequest, NextApiResponse } from "next"

type CourseDefaults = {
  courses: CourseDefault[]
}

type CourseDefault = {
  externalId: string
  name: string
  summary?: string
  level?: string
  hidden?: boolean
  language?: string[]
  prerequisites?: string[]
  tags?: string[]
  outcomes?: string[]
  groups?: CourseGroupDefault[]
  items?: CourseItemDefault[]
}

type CourseGroupDefault = {
  name: string
  summary?: string
  order?: number
  items?: CourseItemDefault[]
}

type CourseItemDefault = {
  order?: number
  section: string
}

type SyncMode = "review" | "apply"

type Data =
  | {
      mode: "review"
      review: CourseSyncReview
      summary: { unchanged: number; newCourses: number; changedCourses: number }
    }
  | {
      mode: "apply"
      created: number
      updated: number
      skipped: number
      appliedExternalIds: string[]
    }
  | { error: string }

const loadDefaults = async (): Promise<CourseDefaults> => {
  const defaultsPath = path.join(process.cwd(), "config", "courses.defaults.json")
  const raw = await readFile(defaultsPath, "utf8")
  return JSON.parse(raw) as CourseDefaults
}

const resetCourseSequences = async () => {
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Course"', 'id'), COALESCE((SELECT MAX(id) FROM "Course"), 1))`
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"CourseGroup"', 'id'), COALESCE((SELECT MAX(id) FROM "CourseGroup"), 1))`
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"CourseItem"', 'id'), COALESCE((SELECT MAX(id) FROM "CourseItem"), 1))`
}

const syncOneCourse = async (course: CourseJsonInput): Promise<"created" | "updated"> => {
  const normalized = normalizeCourseJson(course)
  const existing = await prisma.course.findUnique({
    where: { externalId: course.externalId },
    select: { id: true },
  })

  const upserted = await prisma.course.upsert({
    where: { externalId: course.externalId },
    update: {
      name: normalized.base.name,
      summary: normalized.base.summary,
      level: normalized.base.level,
      hidden: normalized.base.hidden,
      language: normalized.base.language,
      prerequisites: normalized.base.prerequisites,
      tags: normalized.base.tags,
      outcomes: normalized.base.outcomes,
    },
    create: {
      externalId: normalized.base.externalId,
      name: normalized.base.name,
      summary: normalized.base.summary,
      level: normalized.base.level,
      hidden: normalized.base.hidden,
      language: normalized.base.language,
      prerequisites: normalized.base.prerequisites,
      tags: normalized.base.tags,
      outcomes: normalized.base.outcomes,
    },
  })

  await prisma.courseGroup.deleteMany({ where: { courseId: upserted.id } })
  await prisma.courseItem.deleteMany({ where: { courseId: upserted.id } })

  for (const group of normalized.groups) {
    const createdGroup = await prisma.courseGroup.create({
      data: {
        courseId: upserted.id,
        name: group.name,
        summary: group.summary,
        order: group.order,
      },
    })

    if (group.items.length > 0) {
      await prisma.courseItem.createMany({
        data: group.items.map((item) => ({
          courseId: upserted.id,
          groupId: createdGroup.id,
          order: item.order,
          section: item.section,
        })),
      })
    }
  }

  if (normalized.items.length > 0) {
    await prisma.courseItem.createMany({
      data: normalized.items.map((item) => ({
        courseId: upserted.id,
        order: item.order,
        section: item.section,
      })),
    })
  }

  return existing ? "updated" : "created"
}

const syncDefaultsHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const defaults = await loadDefaults()
  const mode = ((req.body?.mode as SyncMode | undefined) ?? "review") as SyncMode

  const existingCourses = await prisma.course.findMany({
    where: {
      externalId: {
        in: (defaults.courses ?? []).map((course) => course.externalId).filter(Boolean),
      },
    },
    include: {
      CourseGroup: {
        orderBy: { order: "asc" },
        include: { CourseItem: { orderBy: { order: "asc" } } },
      },
      CourseItem: {
        where: { groupId: null },
        orderBy: { order: "asc" },
      },
    },
  })

  const review = reviewCourseDefaults(defaults.courses, existingCourses)

  if (mode === "review") {
    res.status(200).json({
      mode: "review",
      review,
      summary: {
        unchanged: review.unchanged.length,
        newCourses: review.newCourses.length,
        changedCourses: review.changedCourses.length,
      },
    })
    return
  }

  const selectedExternalIds = Array.isArray(req.body?.externalIds)
    ? req.body.externalIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : []

  await resetCourseSequences()

  const defaultsByExternalId = new Map((defaults.courses ?? []).map((course) => [course.externalId, course]))
  let created = 0
  let updated = 0
  let skipped = 0
  const appliedExternalIds: string[] = []

  for (const externalId of selectedExternalIds) {
    const course = defaultsByExternalId.get(externalId)
    if (!course) {
      skipped += 1
      continue
    }

    const result = await syncOneCourse(course)
    if (result === "created") created += 1
    else updated += 1
    appliedExternalIds.push(externalId)
  }

  res.status(200).json({ mode: "apply", created, updated, skipped, appliedExternalIds })
}

export default syncDefaultsHandler
