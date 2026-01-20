import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "lib/prisma"
import { readFile } from "fs/promises"
import path from "path"

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
  languages?: string[]
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

type Data = { synced: number } | { error: string }

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

  const defaultsPath = path.join(process.cwd(), "config", "courses.defaults.json")
  const raw = await readFile(defaultsPath, "utf8")
  const defaults: CourseDefaults = JSON.parse(raw)

  let synced = 0
  for (const course of defaults.courses ?? []) {
    const upserted = await prisma.course.upsert({
      where: { externalId: course.externalId },
      update: {
        name: course.name,
        summary: course.summary ?? "",
        level: course.level ?? "",
        hidden: !!course.hidden,
        languages: course.languages ?? [],
        prerequisites: course.prerequisites ?? [],
        tags: course.tags ?? [],
        outcomes: course.outcomes ?? [],
      },
      create: {
        externalId: course.externalId,
        name: course.name,
        summary: course.summary ?? "",
        level: course.level ?? "",
        hidden: !!course.hidden,
        languages: course.languages ?? [],
        prerequisites: course.prerequisites ?? [],
        tags: course.tags ?? [],
        outcomes: course.outcomes ?? [],
      },
    })

    await prisma.courseGroup.deleteMany({ where: { courseId: upserted.id } })
    await prisma.courseItem.deleteMany({ where: { courseId: upserted.id } })

    for (const group of course.groups ?? []) {
      const createdGroup = await prisma.courseGroup.create({
        data: {
          courseId: upserted.id,
          name: group.name,
          summary: group.summary ?? "",
          order: group.order ?? 0,
        },
      })
      if (group.items?.length) {
        await prisma.courseItem.createMany({
          data: group.items.map((item, idx) => ({
            courseId: upserted.id,
            groupId: createdGroup.id,
            order: item.order ?? idx + 1,
            section: item.section,
          })),
        })
      }
    }

    if (course.items?.length) {
      await prisma.courseItem.createMany({
        data: course.items.map((item, idx) => ({
          courseId: upserted.id,
          order: item.order ?? idx + 1,
          section: item.section,
        })),
      })
    }

    synced += 1
  }

  res.status(200).json({ synced })
}

export default syncDefaultsHandler
