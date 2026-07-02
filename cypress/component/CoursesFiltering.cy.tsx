import React, { useState } from "react"
import { Card } from "flowbite-react"
import CourseFilters from "components/courses/CourseFilters"
import CourseGrid from "components/courses/CourseGrid"
import { matchesCourseFilters } from "lib/courseFilters"
import type { Course } from "pages/api/course"

const courses: Course[] = [
  {
    id: 1,
    externalId: "intro_python",
    name: "Intro to Python",
    summary: "Learn Python basics",
    level: "beginner",
    hidden: false,
    language: ["python"],
    prerequisites: [],
    tags: ["basics"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
  {
    id: 2,
    externalId: "functional_cpp",
    name: "Functional C++",
    summary: "Higher-order programming in C++",
    level: "advanced",
    hidden: false,
    language: ["cpp"],
    prerequisites: [],
    tags: ["functional"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
  {
    id: 3,
    externalId: "python_data",
    name: "Python for Data",
    summary: "Data workflows in Python",
    level: "intermediate",
    hidden: false,
    language: ["python"],
    prerequisites: [],
    tags: ["data"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
]

const CoursesFilteringHarness: React.FC = () => {
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  const filteredCourses = courses.filter((course) =>
    matchesCourseFilters(course, {
      search,
      selectedLevel,
      selectedTags,
      selectedLanguages,
    })
  )

  const tagOptions = Array.from(new Set(courses.flatMap((course) => course.tags))).sort()
  const languageOptions = Array.from(new Set(courses.flatMap((course) => course.language))).sort()

  return (
    <div className="p-4">
      <CourseFilters
        search={search}
        setSearch={setSearch}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        toggleTag={toggleTag}
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
        tagOptions={tagOptions}
        languageOptions={languageOptions}
      />
      {filteredCourses.length > 0 ? (
        <CourseGrid courses={filteredCourses} onTagClick={toggleTag} />
      ) : (
        <Card>
          <p>No courses match your filters.</p>
        </Card>
      )}
    </div>
  )
}

describe("<CoursesFilteringHarness />", () => {
  it("filters courses by search, level, language, and tag", () => {
    cy.mount(<CoursesFilteringHarness />)

    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Functional C++").should("be.visible")
    cy.contains("Python for Data").should("be.visible")

    cy.contains("button", "Filters").click()
    cy.get('input[placeholder="Search courses..."]').type("python")
    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Python for Data").should("be.visible")
    cy.contains("Functional C++").should("not.exist")

    cy.get("select").select("intermediate")
    cy.contains("Intro to Python").should("not.exist")
    cy.contains("Python for Data").should("be.visible")

    cy.contains("button", "data").click()
    cy.contains("Python for Data").should("be.visible")

    cy.contains("button", "Clear").click()
    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Functional C++").should("be.visible")
    cy.contains("Python for Data").should("be.visible")
  })

  it("filters the list when a tag chip on a course card is clicked, and keeps other filters when toggled off", () => {
    cy.mount(<CoursesFilteringHarness />)

    // Only "Intro to Python" has the "basics" tag, so this button is unique to
    // its card. Clicking it must update the same filter state as the filter
    // panel, not navigate away from it.
    cy.get("[data-cy='tag-filter-button-basics']").click()

    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Functional C++").should("not.exist")
    cy.contains("Python for Data").should("not.exist")
    cy.get("[data-cy='active-tag-basics']").should("be.visible")

    // Selecting an unrelated filter afterwards must not drop the tag that was
    // set via the card - both filters should apply together.
    cy.contains("button", "Filters").click()
    cy.get("select").select("beginner")
    cy.contains("Intro to Python").should("be.visible")
    cy.get("[data-cy='active-tag-basics']").should("be.visible")

    cy.get("[data-cy='active-tag-basics']").click()
    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Functional C++").should("not.exist")
    cy.contains("Python for Data").should("not.exist")
  })
})
