import React from "react"
import CourseProgressBar from "components/courses/CourseProgressBar"

describe("<CourseProgressBar />", () => {
  it("renders the default label, counts, and computed width", () => {
    cy.mount(<CourseProgressBar completed={3} total={6} />)

    cy.contains("Progress").should("be.visible")
    cy.contains("3/6").should("be.visible")
    cy.get('[data-cy="course-progress-fill"]').should("have.attr", "style").and("contain", "width: 50%")
  })

  it("supports the compact mode used on the homepage", () => {
    cy.mount(<CourseProgressBar completed={2} total={5} hideLabelRow className="w-24" />)

    cy.contains("Progress").should("not.exist")
    cy.contains("2/5").should("not.exist")
    cy.get('[data-cy="course-progress-fill"]').should("have.attr", "style").and("contain", "width: 40%")
  })
})
