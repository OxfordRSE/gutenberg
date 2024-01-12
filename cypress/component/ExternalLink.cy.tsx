import React from "react"
import ExternalLink from "components/ui/ExternalLink"

describe("ExternalList", () => {
  it("renders", () => {
    cy.mount(<ExternalLink href="https://www.example.com/">test</ExternalLink>)
  })
})
