import React from "react"
import ProgressDistribution from "components/ui/ProgressDistribution"

describe("<ProgressDistribution />", () => {
  it("renders rows with count percentages and proportional bar widths", () => {
    cy.mount(
      <ProgressDistribution
        totalCount={4}
        entries={[
          { band: "notStarted", label: "0%", count: 1 },
          { band: "oneToTwenty", label: "1-20%", count: 3 },
        ]}
      />
    )

    cy.contains("0%").should("be.visible")
    cy.contains("1 (25%)").should("be.visible")
    cy.contains("1-20%").should("be.visible")
    cy.contains("3 (75%)").should("be.visible")

    cy.get(".bg-cyan-600").eq(0).should("have.attr", "style").and("contain", "width: 25%")
    cy.get(".bg-cyan-600").eq(1).should("have.attr", "style").and("contain", "width: 75%")
  })

  it("shows the no-trackable summary only when count is positive", () => {
    cy.mount(
      <ProgressDistribution
        totalCount={2}
        noTrackableCount={2}
        noTrackableLabel="No trackable problems"
        entries={[{ band: "complete", label: "100%", count: 0 }]}
      />
    )
    cy.contains("No trackable problems:").should("be.visible")
    cy.contains("2").should("be.visible")

    cy.mount(
      <ProgressDistribution
        totalCount={2}
        noTrackableCount={0}
        noTrackableLabel="No trackable problems"
        entries={[{ band: "complete", label: "100%", count: 0 }]}
      />
    )
    cy.contains("No trackable problems:").should("not.exist")
  })
})
