import React from "react"
import { LinkedSection } from "components/ui/LinkedSection"

describe("<LinkedSection />", () => {
  it("formats tags and shows them as pills", () => {
    cy.viewport(1280, 720)
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

  it("renders event links with the event styling and previous chevron", () => {
    cy.viewport(1280, 720)
    cy.mount(
      <LinkedSection
        linkedType="event"
        direction="prev"
        url="/material/HPCu/software_architecture_and_design/procedural/intro"
        theme="Software Architecture and Design"
        course="Procedural Programming"
        section="Intro"
      />
    )

    cy.get('a[href="/material/HPCu/software_architecture_and_design/procedural/intro"]').should("be.visible")
    cy.contains("Intro").should("be.visible")
    cy.get(".border-teal-700").should("exist")
    cy.get(".nav-chevron").should("have.length", 1)
  })

  it("renders a compact icon-only card on small screens", () => {
    cy.viewport(500, 700)
    cy.mount(
      <LinkedSection
        linkedType="internal"
        direction="next"
        url="/material/HPCu/software_architecture_and_design/procedural/vectors"
        theme="Software Architecture and Design"
        course="Procedural Programming"
        section="Vectors"
        tags={["cpp"]}
      />
    )

    cy.get('a[href="/material/HPCu/software_architecture_and_design/procedural/vectors"]').should("be.visible")
    cy.get(".nav-chevron").should("have.length", 1)
    cy.contains("Software Architecture and Design").should("not.exist")
    cy.get('[data-cy="linked-section-tags"]').should("not.exist")
  })

  it("renders the terminal return-to-course card", () => {
    cy.viewport(1280, 720)
    cy.mount(<LinkedSection linkedType="course" direction="next" url="/courses/7" section="Return to course" />)

    cy.get('a[href="/courses/7"]').should("be.visible")
    cy.contains("Return to course").should("be.visible")
    cy.get(".border-amber-600").should("exist")
  })
})
