import React from "react"
import NavDiagram from "components/navdiagram/NavDiagram"
import type { Excludes, Material, MaterialCourse, MaterialSection, MaterialTheme } from "lib/material"

const THEME = "ai_tooling"
const COURSE = "copilots"

function makeSection(file: string, name: string, dependsOn: string[], index: number): MaterialSection {
  return {
    id: file.replace(/\.md$/, ""),
    file,
    course: COURSE,
    theme: THEME,
    name,
    markdown: "",
    dependsOn,
    tags: [],
    index,
    type: "Section",
    attribution: [],
    problems: [],
    learningOutcomes: [],
  }
}

// Mirrors the content that broke the live course map (#655): the first section
// depends on its own course, which isn't a section node, alongside the normal
// "depends on the previous section" chain.
function makeMaterial(introDependsOn: string[]): { material: Material; theme: MaterialTheme; course: MaterialCourse } {
  const sections = [
    makeSection("00_intro.md", "Introduction", introDependsOn, 0),
    makeSection("01_next.md", "Next steps", [`${THEME}.${COURSE}.00_intro`], 1),
    makeSection("02_last.md", "Wrapping up", [`${THEME}.${COURSE}.01_next`], 2),
  ]
  const course: MaterialCourse = {
    id: COURSE,
    theme: THEME,
    name: "Careful coding",
    dependsOn: [],
    markdown: "",
    sections,
    type: "Course",
    attribution: [],
    summary: "",
    files: [],
    learningOutcomes: [],
  }
  const theme: MaterialTheme = {
    repo: "HPCu",
    id: THEME,
    name: "AI tooling",
    markdown: "",
    courses: [course],
    type: "Theme",
  }
  const material: Material = { name: "Material", markdown: "", themes: [theme], type: "Material" }
  return { material, theme, course }
}

const sectionNodes = () => cy.get(".react-flow__node-section")
const edges = () => cy.get(".react-flow__edge")

describe("<NavDiagram />", () => {
  it("renders the full material map when a section depends on its own course", () => {
    const { material } = makeMaterial([`${THEME}.${COURSE}`])
    cy.mount(<NavDiagram material={material} />)

    sectionNodes().should("have.length", 3)
    cy.contains("Introduction").should("exist")
    cy.contains("Wrapping up").should("exist")
    // Only the two real section-to-section dependencies become edges.
    edges().should("have.length", 2)
  })

  it("renders the course diagram when a section depends on its own course", () => {
    const { material, theme, course } = makeMaterial([`${THEME}.${COURSE}`])
    cy.mount(<NavDiagram material={material} theme={theme} course={course} />)

    sectionNodes().should("have.length", 3)
    edges().should("have.length", 2)
  })

  it("drops edges from excluded sections instead of failing", () => {
    const { material, theme, course } = makeMaterial([])
    const excludes: Excludes = { themes: [], courses: [], sections: ["00_intro"] }
    cy.mount(<NavDiagram material={material} theme={theme} course={course} excludes={excludes} />)

    sectionNodes().should("have.length", 2)
    cy.contains("Introduction").should("not.exist")
    edges().should("have.length", 1)
  })
})
