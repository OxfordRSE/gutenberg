type CourseLike = {
  level?: string | null
  name?: string | null
}

const levelOrder: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
}

export function sortCourses<T extends CourseLike>(courses: T[]): T[] {
  return [...courses].sort((a, b) => {
    const aLevel = levelOrder[a.level?.toLowerCase?.() ?? ""] ?? 99
    const bLevel = levelOrder[b.level?.toLowerCase?.() ?? ""] ?? 99
    if (aLevel !== bLevel) return aLevel - bLevel
    return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  })
}
