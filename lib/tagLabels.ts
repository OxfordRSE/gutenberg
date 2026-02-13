// This file can contain functions for formatting tag labels, currently only used to format "cpp" as C++ but we can support more complex cases in the future.

const normalizeTag = (tag: string) => tag.trim().toLowerCase()

export const formatTagLabel = (tag: string): string => {
  const normalized = normalizeTag(tag)
  if (normalized === "cpp" || normalized === "c++") return "C++"
  if (normalized === "python") return "Python"
  return tag
}

export const formatTagList = (tags: string[]): string[] => tags.map(formatTagLabel)
