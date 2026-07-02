import React from "react"
import TagChip from "components/ui/TagChip"

describe("<TagChip />", () => {
  it("renders as plain text when neither onClick nor linkToFilter is given", () => {
    cy.mount(<TagChip tag="basics" />)

    cy.contains("basics").should("be.visible")
    cy.get("a").should("not.exist")
    cy.get("button").should("not.exist")
  })

  it("renders as a link to the prefiltered course list when linkToFilter is set", () => {
    cy.mount(<TagChip tag="basics" linkToFilter />)

    cy.get("[data-cy='tag-filter-link-basics']")
      .should("have.attr", "href")
      .and("include", "/courses?tag=basics")
    cy.get("button").should("not.exist")
  })

  it("renders as a button and calls onClick instead of navigating when onClick is given", () => {
    const onClick = cy.stub().as("onClick")
    cy.mount(<TagChip tag="basics" onClick={onClick} />)

    cy.get("[data-cy='tag-filter-button-basics']").should("be.visible").and("not.have.attr", "href")
    cy.get("[data-cy='tag-filter-button-basics']").click()
    cy.get("@onClick").should("have.been.calledOnce")
  })

  it("prefers onClick over linkToFilter when both are given", () => {
    const onClick = cy.stub().as("onClick")
    cy.mount(<TagChip tag="basics" linkToFilter onClick={onClick} />)

    cy.get("a").should("not.exist")
    cy.get("[data-cy='tag-filter-button-basics']").click()
    cy.get("@onClick").should("have.been.calledOnce")
  })
})
