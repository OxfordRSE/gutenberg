import React from "react"
import PercentageMeter from "components/ui/PercentageMeter"

describe("<PercentageMeter />", () => {
  it("renders percent text and fill width for numeric values", () => {
    cy.mount(<PercentageMeter value={42} />)

    cy.contains("42.0%").should("be.visible")
    cy.get(".bg-cyan-600").should("have.attr", "style").and("contain", "width: 42%")
  })

  it("renders N/A with zero width when value is null", () => {
    cy.mount(<PercentageMeter value={null} />)

    cy.contains("N/A").should("be.visible")
    cy.get(".bg-cyan-600").should("have.attr", "style").and("contain", "width: 0%")
  })
})
