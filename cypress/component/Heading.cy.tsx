import React from "react"
import Heading from "components/content/Heading"

const stubClipboard = (alias: string) => {
  cy.window().then((win) => {
    const writeText = cy
      .stub()
      .callsFake(() => Promise.resolve())
      .as(alias)
    Object.defineProperty(win.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })
  })
}

describe("<Heading />", () => {
  it("renders the requested heading tag and applies the optional span id", () => {
    cy.mount(<Heading content="Secure Content" section="course.section" tag="h3" spanId="secure-content-span" />)

    cy.get("h3#Secure-Content").should("exist")
    cy.get("#secure-content-span").should("contain.text", "Secure Content")
  })

  it("copies the heading link to the clipboard", () => {
    cy.mount(<Heading content="Secure Content" section="course.section" tag="h2" />)

    stubClipboard("writeHeadingLink")

    cy.window().then((win) => {
      const expectedUrl = `${win.location.href.split("#")[0]}#Secure-Content`
      cy.wrap(expectedUrl).as("expectedHeadingUrl")
    })

    cy.get("h2#Secure-Content button").click()
    cy.get("@expectedHeadingUrl").then((expectedHeadingUrl) => {
      cy.get("@writeHeadingLink").should("have.been.calledOnceWith", expectedHeadingUrl)
    })
    cy.get('[data-cy="copy-feedback"]').should("be.visible").and("contain.text", "Copied to clipboard!")
  })

  it("generates the copied heading url from React child content", () => {
    cy.mount(
      <Heading
        content={
          <>
            <code>Secure</code>
            {" Content"}
          </>
        }
        section="course.section"
        tag="h2"
      />
    )

    stubClipboard("writeHeadingLinkFromNode")

    cy.window().then((win) => {
      const expectedUrl = `${win.location.href.split("#")[0]}#Secure-Content`
      cy.wrap(expectedUrl).as("expectedHeadingUrlFromNode")
    })

    cy.get("h2#Secure-Content").should("exist")
    cy.get("h2#Secure-Content button").click()
    cy.get("@expectedHeadingUrlFromNode").then((expectedHeadingUrl) => {
      cy.get("@writeHeadingLinkFromNode").should("have.been.calledOnceWith", expectedHeadingUrl)
    })
  })
})
