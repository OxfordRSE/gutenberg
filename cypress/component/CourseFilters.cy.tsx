import React, { useState } from "react"
import CourseFilters from "components/courses/CourseFilters"

const CourseFiltersHarness: React.FC = () => {
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  return (
    <CourseFilters
      search={search}
      setSearch={setSearch}
      selectedLevel={selectedLevel}
      setSelectedLevel={setSelectedLevel}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      selectedLanguages={selectedLanguages}
      setSelectedLanguages={setSelectedLanguages}
      tagOptions={["basics", "functional"]}
      languageOptions={["python", "cpp"]}
    />
  )
}

describe("<CourseFilters />", () => {
  it("starts collapsed and expands on click", () => {
    cy.mount(<CourseFiltersHarness />)

    cy.contains("button", "Filters").should("be.visible")
    cy.get('input[placeholder="Search courses..."]').should("not.exist")

    cy.contains("button", "Filters").click()
    cy.get('input[placeholder="Search courses..."]').should("be.visible")
    cy.contains("Languages").should("be.visible")
    cy.contains("Tags").should("be.visible")
  })

  it("lets you apply and clear filters", () => {
    cy.mount(<CourseFiltersHarness />)

    cy.contains("button", "Filters").click()
    cy.get('input[placeholder="Search courses..."]').type("python")
    cy.get("select").select("beginner")
    cy.contains("button", "Python").click()
    cy.contains("button", "basics").click()

    cy.contains('"python"').should("be.visible")
    cy.contains("beginner").should("be.visible")
    cy.contains("Python").should("be.visible")
    cy.contains("basics").should("be.visible")
    cy.contains("button", "Clear").click()

    cy.contains('"python"').should("not.exist")
    cy.contains("button", "beginner").should("not.exist")
    cy.get('input[placeholder="Search courses..."]').should("have.value", "")
    cy.get("select").should("have.value", "")
  })
})
