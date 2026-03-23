import React from "react"
import { LinkedSection } from "components/ui/LinkedSection"

describe("<LinkedSection />", () => {
  it("formats tags and shows them as pills", () => {
    cy.mount(
      <LinkedSection
        linkedType="course"
        direction="next"
        url="/material/HPCu/software_architecture_and_design/procedural/containers_cpp"
        theme="Software Architecture and Design"
        course="Procedural Programming"
        section="Containers and Arrays in C++"
        tags={["cpp", "python"]}
      />
    )

    cy.contains("Software Architecture and Design").should("be.visible")
    cy.contains("Procedural Program...").should("be.visible")
    cy.contains("Containers an...").should("be.visible")
    cy.get('[data-cy="linked-section-tags"]').within(() => {
      cy.contains("C++").should("be.visible").and("have.class", "rounded-full")
      cy.contains("Python").should("be.visible").and("have.class", "rounded-full")
      cy.contains("cpp").should("not.exist")
    })
  })
})
