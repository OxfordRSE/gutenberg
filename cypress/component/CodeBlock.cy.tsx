import React from "react"
import CodeBlock from "components/content/CodeBlock"

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

describe("<CodeBlock />", () => {
  it("renders the plain code branch when no language is provided", () => {
    const code = "const value = 42"

    cy.mount(<CodeBlock code={code} className="plain-code" />)

    cy.get("code.plain-code").should("contain.text", code)
    cy.contains("button", "Copy").should("be.visible")
  })

  it("renders the syntax-highlighted branch when a language is provided", () => {
    const code = 'print("hello")'

    cy.mount(<CodeBlock code={code} language="python" />)

    cy.get("code.text-sm").should("contain.text", code)
    cy.contains("button", "Copy").should("be.visible")
  })

  it("copies the code contents to the clipboard", () => {
    const code = 'print("hello")'

    cy.mount(<CodeBlock code={code} language="python" />)

    stubClipboard("writeCodeText")

    cy.contains("button", "Copy").click()
    cy.get("@writeCodeText").should("have.been.calledOnceWith", code)
    cy.get('[data-cy="copy-feedback"]').should("be.visible").and("contain.text", "Copied to clipboard!")
  })
})
