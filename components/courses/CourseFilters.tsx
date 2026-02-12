import React, { useMemo, useState } from "react"
import { Button, Select, TextInput } from "flowbite-react"
import { getTagColor } from "lib/tagColors"
import { formatTagLabel } from "lib/tagLabels"

type Props = {
  search: string
  setSearch: (value: string) => void
  selectedLevel: string
  setSelectedLevel: (value: string) => void
  selectedTags: string[]
  setSelectedTags: (value: string[]) => void
  selectedLanguages: string[]
  setSelectedLanguages: (value: string[]) => void
  tagOptions: string[]
  languageOptions: string[]
}

const CourseFilters: React.FC<Props> = ({
  search,
  setSearch,
  selectedLevel,
  setSelectedLevel,
  selectedTags,
  setSelectedTags,
  selectedLanguages,
  setSelectedLanguages,
  tagOptions,
  languageOptions,
}) => {
  const [expanded, setExpanded] = useState(false)
  const activeCount = selectedTags.length + selectedLanguages.length + (search.trim() ? 1 : 0) + (selectedLevel ? 1 : 0)

  const clearFilters = () => {
    setSearch("")
    setSelectedLevel("")
    setSelectedTags([])
    setSelectedLanguages([])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((t) => t !== language) : [...prev, language]
    )
  }

  const hasFilters = activeCount > 0
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs" color="gray" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "Hide filters" : "Filters"}
          </Button>
          {selectedLevel && (
            <button
              type="button"
              onClick={() => setSelectedLevel("")}
              className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {selectedLevel}
              <span className="text-xs">×</span>
            </button>
          )}
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {`"${search.trim()}"`}
              <span className="text-xs">×</span>
            </button>
          )}
          {selectedLanguages.map((language) => {
            const color = getTagColor(language)
            return (
              <button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm"
                style={{ backgroundColor: color.background, borderColor: "transparent", color: color.text }}
              >
                {formatTagLabel(language)}
                <span className="text-xs">×</span>
              </button>
            )
          })}
          {selectedTags.map((tag) => (
            (() => {
              const color = getTagColor(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm"
                  style={{ backgroundColor: color.background, borderColor: "transparent", color: color.text }}
                >
                  {formatTagLabel(tag)}
                  <span className="text-xs">×</span>
                </button>
              )
            })()
          ))}
        </div>
        {hasFilters && (
          <Button size="xs" color="gray" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
            />
            <Select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>

          {(languageOptions.length > 0 || tagOptions.length > 0) && (
            <div className="mt-4 space-y-3">
              {languageOptions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Languages</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {languageOptions.map((language) => {
                      const isActive = selectedLanguages.includes(language)
                      const color = getTagColor(language)
                      return (
                        <button
                          key={language}
                          type="button"
                          onClick={() => toggleLanguage(language)}
                          className={`rounded-full border-2 px-3 py-1 text-xs font-semibold transition ${
                            isActive
                              ? "shadow-sm"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                          }`}
                          style={
                            isActive
                              ? { backgroundColor: color.background, borderColor: color.background, color: color.text }
                              : undefined
                          }
                        >
                          {formatTagLabel(language)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {tagOptions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tags</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tagOptions.map((tag) => {
                      const isActive = selectedTags.includes(tag)
                      const color = getTagColor(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border-2 px-3 py-1 text-xs font-semibold transition ${
                            isActive
                              ? "shadow-sm"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                          }`}
                          style={
                            isActive
                              ? { backgroundColor: color.background, borderColor: color.background, color: color.text }
                              : undefined
                          }
                        >
                          {formatTagLabel(tag)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseFilters
