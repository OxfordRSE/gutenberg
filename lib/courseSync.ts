import { CourseJsonInput, NormalizedCourseJson, courseToJson, normalizeCourseJson } from "lib/courseJson"

type CourseSyncDiffField =
  | "name"
  | "summary"
  | "level"
  | "hidden"
  | "language"
  | "prerequisites"
  | "tags"
  | "outcomes"
  | "group"
  | "items"

export type CourseSyncDiff = {
  id: string
  field: CourseSyncDiffField
  label: string
  current: string
  incoming: string
}

export type CourseSyncCourseReview = {
  externalId: string
  name: string
  diffs: CourseSyncDiff[]
}

export type CourseSyncReview = {
  unchanged: { externalId: string; name: string }[]
  newCourses: CourseSyncCourseReview[]
  changedCourses: CourseSyncCourseReview[]
}

type DbCourseShape = {
  externalId?: string | null
  name?: string | null
  summary?: string | null
  level?: string | null
  hidden?: boolean | null
  language?: string[] | null
  prerequisites?: string[] | null
  tags?: string[] | null
  outcomes?: string[] | null
  CourseGroup?: {
    name?: string | null
    summary?: string | null
    order?: number | null
    CourseItem?: { section: string; order?: number | null }[]
  }[]
  CourseItem?: { section: string; order?: number | null; groupId?: number | null }[]
}

const fieldLabels: Record<CourseSyncDiffField, string> = {
  name: "Title",
  summary: "Summary",
  level: "Level",
  hidden: "Hidden",
  language: "Language",
  prerequisites: "Prerequisites",
  tags: "Tags",
  outcomes: "Outcomes",
  group: "Material group",
  items: "Ungrouped material",
}

export const normalizeDefaultCourse = (course: CourseJsonInput): NormalizedCourseJson => normalizeCourseJson(course)

export const normalizeDatabaseCourse = (course: DbCourseShape): NormalizedCourseJson =>
  normalizeCourseJson(courseToJson(course))

const formatStringList = (values: string[]): string => (values.length > 0 ? values.join(", ") : "—")

const formatGroupedItems = (
  groups: { name: string; summary: string; order: number; items: { section: string; order: number }[] }[]
): string => {
  if (groups.length === 0) return "—"
  return groups
    .map((group) => {
      const summary = group.summary ? ` — ${group.summary}` : ""
      const items =
        group.items.length > 0 ? group.items.map((item) => `  ${item.order}. ${item.section}`).join("\n") : "  —"
      return `${group.order}. ${group.name || "Untitled"}${summary}\n${items}`
    })
    .join("\n\n")
}

const formatGroup = (group?: {
  name: string
  summary: string
  order: number
  items: { section: string; order: number }[]
}): string => {
  if (!group) return "—"
  const summary = group.summary ? ` — ${group.summary}` : ""
  const items =
    group.items.length > 0 ? group.items.map((item) => `  ${item.order}. ${item.section}`).join("\n") : "  —"
  return `${group.order}. ${group.name || "Untitled"}${summary}\n${items}`
}

const formatItems = (items: { section: string; order: number }[]): string => {
  if (items.length === 0) return "—"
  return items.map((item) => `${item.order}. ${item.section}`).join("\n")
}

const formatCourseField = (course: NormalizedCourseJson, field: CourseSyncDiffField): string => {
  switch (field) {
    case "name":
      return course.base.name || "—"
    case "summary":
      return course.base.summary || "—"
    case "level":
      return course.base.level || "—"
    case "hidden":
      return course.base.hidden ? "true" : "false"
    case "language":
      return formatStringList(course.base.language)
    case "prerequisites":
      return formatStringList(course.base.prerequisites)
    case "tags":
      return formatStringList(course.base.tags)
    case "outcomes":
      return formatStringList(course.base.outcomes)
    case "group":
      return formatGroupedItems(course.groups)
    case "items":
      return formatItems(course.items)
  }
}

const areNormalizedCoursesEqual = (current: NormalizedCourseJson, incoming: NormalizedCourseJson): boolean =>
  JSON.stringify(current) === JSON.stringify(incoming)

export const diffNormalizedCourses = (
  current: NormalizedCourseJson,
  incoming: NormalizedCourseJson
): CourseSyncDiff[] => {
  const fields: Exclude<CourseSyncDiffField, "group">[] = [
    "name",
    "summary",
    "level",
    "hidden",
    "language",
    "prerequisites",
    "tags",
    "outcomes",
    "items",
  ]

  const scalarDiffs: CourseSyncDiff[] = fields.flatMap((field) => {
    const currentValue = formatCourseField(current, field)
    const incomingValue = formatCourseField(incoming, field)
    if (currentValue === incomingValue) return []
    return [
      {
        id: field,
        field,
        label: fieldLabels[field],
        current: currentValue,
        incoming: incomingValue,
      },
    ]
  })

  const maxGroups = Math.max(current.groups.length, incoming.groups.length)
  const groupDiffs: CourseSyncDiff[] = []

  for (let index = 0; index < maxGroups; index += 1) {
    const currentGroup = current.groups[index]
    const incomingGroup = incoming.groups[index]

    if (JSON.stringify(currentGroup) === JSON.stringify(incomingGroup)) {
      continue
    }

    const groupName = incomingGroup?.name || currentGroup?.name || `Group ${index + 1}`
    const label = !currentGroup
      ? `New material group: ${groupName}`
      : !incomingGroup
        ? `Removed material group: ${groupName}`
        : `Material group ${index + 1}: ${groupName}`

    groupDiffs.push({
      id: `group-${index + 1}`,
      field: "group",
      label,
      current: formatGroup(currentGroup),
      incoming: formatGroup(incomingGroup),
    })
  }

  return [...scalarDiffs, ...groupDiffs]
}

export const reviewCourseDefaults = (defaults: CourseJsonInput[], courses: DbCourseShape[]): CourseSyncReview => {
  const coursesByExternalId = new Map(
    courses.filter((course) => course.externalId).map((course) => [course.externalId as string, course])
  )

  const review: CourseSyncReview = {
    unchanged: [],
    newCourses: [],
    changedCourses: [],
  }

  for (const defaultCourse of defaults) {
    if (!defaultCourse.externalId) continue
    const incoming = normalizeDefaultCourse(defaultCourse)
    const existing = coursesByExternalId.get(defaultCourse.externalId)

    if (!existing) {
      review.newCourses.push({
        externalId: defaultCourse.externalId,
        name: incoming.base.name,
        diffs: [],
      })
      continue
    }

    const current = normalizeDatabaseCourse(existing)
    if (areNormalizedCoursesEqual(current, incoming)) {
      review.unchanged.push({ externalId: defaultCourse.externalId, name: incoming.base.name })
      continue
    }

    review.changedCourses.push({
      externalId: defaultCourse.externalId,
      name: incoming.base.name,
      diffs: diffNormalizedCourses(current, incoming),
    })
  }

  return review
}
