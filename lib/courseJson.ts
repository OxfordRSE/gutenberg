export type CourseJsonGroup = {
  name?: string
  summary?: string
  order?: number
  items?: (string | { section: string; order?: number })[]
}

export type CourseJson = {
  externalId?: string
  name?: string
  summary?: string
  level?: string
  hidden?: boolean
  language?: string[]
  prerequisites?: string[]
  tags?: string[]
  outcomes?: string[]
  groups?: CourseJsonGroup[]
  items?: (string | { section: string; order?: number })[]
}

export type CourseJsonInput = CourseJson & {
  CourseGroup?: {
    name?: string
    summary?: string
    order?: number
    CourseItem?: { section: string; order?: number }[]
  }[]
  CourseItem?: { section: string; order?: number; groupId?: number | null }[]
}

export type NormalizedCourseJson = {
  base: {
    name: string
    summary: string
    level: string
    hidden: boolean
    language: string[]
    prerequisites: string[]
    tags: string[]
    outcomes: string[]
    externalId?: string
  }
  groups: { name: string; summary: string; order: number; items: { section: string; order: number }[] }[]
  items: { section: string; order: number }[]
}

const normalizeItems = (items: (string | { section: string; order?: number })[] | undefined) => {
  const normalized =
    items?.map((item, index) =>
      typeof item === "string"
        ? { section: item, order: index + 1 }
        : { section: item.section, order: item.order ?? index + 1 }
    ) ?? []

  return normalized.sort((a, b) => a.order - b.order)
}

export const normalizeCourseJson = (input: CourseJsonInput): NormalizedCourseJson => {
  const groupsSource =
    input.groups ??
    input.CourseGroup?.map((group) => ({
      name: group.name,
      summary: group.summary,
      order: group.order,
      items: (group.CourseItem ?? []).map((item, index) => ({ section: item.section, order: item.order ?? index + 1 })),
    })) ??
    []

  const groups = groupsSource.map((group, index) => ({
    name: group.name ?? "",
    summary: group.summary ?? "",
    order: group.order ?? index + 1,
    items: normalizeItems(group.items),
  }))

  const items =
    input.items ??
    (input.CourseItem ?? [])
      .filter((item) => !item.groupId)
      .map((item, index) => ({ section: item.section, order: item.order ?? index + 1 }))

  return {
    base: {
      externalId: input.externalId,
      name: input.name ?? "",
      summary: input.summary ?? "",
      level: input.level ?? "",
      hidden: !!input.hidden,
      language: input.language ?? [],
      prerequisites: input.prerequisites ?? [],
      tags: input.tags ?? [],
      outcomes: input.outcomes ?? [],
    },
    groups,
    items: normalizeItems(items),
  }
}

export const courseToJson = (course: {
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
}): CourseJson => {
  const groups =
    course.CourseGroup?.map((group) => ({
      name: group.name ?? "",
      summary: group.summary ?? "",
      order: group.order ?? 0,
      items: (group.CourseItem ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item, index) => ({ section: item.section, order: item.order ?? index + 1 })),
    })) ?? []

  const items =
    course.CourseItem?.filter((item) => !item.groupId)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item, index) => ({ section: item.section, order: item.order ?? index + 1 })) ?? []

  return {
    externalId: course.externalId ?? undefined,
    name: course.name ?? "",
    summary: course.summary ?? "",
    level: course.level ?? "",
    hidden: !!course.hidden,
    language: course.language ?? [],
    prerequisites: course.prerequisites ?? [],
    tags: course.tags ?? [],
    outcomes: course.outcomes ?? [],
    groups: groups.length > 0 ? groups : undefined,
    items: items.length > 0 ? items : undefined,
  }
}
