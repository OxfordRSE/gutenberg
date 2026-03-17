import type { Course } from "pages/api/course"

export type CourseFilterState = {
  search: string
  selectedLevel: string
  selectedTags: string[]
  selectedLanguages: string[]
}

export const matchesCourseFilters = (course: Course, filters: CourseFilterState) => {
  const searchValue = filters.search.trim().toLowerCase()
  const matchesSearch =
    !searchValue ||
    course.name.toLowerCase().includes(searchValue) ||
    (course.summary ?? "").toLowerCase().includes(searchValue)
  const matchesLevel = !filters.selectedLevel || course.level === filters.selectedLevel
  const matchesTags =
    filters.selectedTags.length === 0 || filters.selectedTags.some((tag) => (course.tags ?? []).includes(tag))
  const matchesLanguages =
    filters.selectedLanguages.length === 0 ||
    filters.selectedLanguages.some((language) => (course.language ?? []).includes(language))

  return matchesSearch && matchesLevel && matchesTags && matchesLanguages
}
