import React from "react"
import CourseSectionLink from "components/courses/CourseSectionLink"
import type { Material } from "lib/material"

const material: Material = {
  name: "Test Material",
  markdown: "",
  type: "Material",
  themes: [
    {
      repo: "HPCu",
      id: "software_architecture_and_design",
      name: "Software Architecture and Design",
      markdown: "",
      type: "Theme",
      courses: [
        {
          id: "procedural",
          theme: "software_architecture_and_design",
          name: "Procedural Programming",
          dependsOn: [],
          markdown: "",
          type: "Course",
          attribution: [],
          summary: "",
          files: [],
          learningOutcomes: [],
          sections: [
            {
              id: "containers_cpp",
              file: "containers_cpp.md",
              course: "procedural",
              theme: "software_architecture_and_design",
              name: "Containers and Arrays in C++",
              markdown: "",
              dependsOn: [],
              tags: ["cpp", "python"],
              index: 0,
              type: "Section",
              attribution: [],
              problems: [],
              learningOutcomes: [],
            },
          ],
        },
      ],
    },
  ],
}

describe("<CourseSectionLink />", () => {
  it("formats tags and shows them as pills", () => {
    cy.mount(
      <CourseSectionLink
        material={material}
        sectionRef="HPCu.software_architecture_and_design.procedural.containers_cpp"
        depth="section"
      />
    )

    cy.contains("Containers and Arrays in C++").should("be.visible")
    cy.get('[data-cy="course-section-link-tags"]').within(() => {
      cy.contains("C++").should("be.visible").and("have.class", "rounded-full")
      cy.contains("Python").should("be.visible").and("have.class", "rounded-full")
      cy.contains("cpp").should("not.exist")
    })
  })
})
