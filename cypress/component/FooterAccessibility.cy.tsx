import Footer from "components/Footer"
import type { PageTemplate } from "lib/pageTemplate"

const basePageInfo: PageTemplate = {
  title: "Example",
  logo: { src: "/ox_rse.svg", alt: "Ox RSE" },
  description: "",
  frontpage: { intro: "" },
  footer: "",
}

describe("<Footer /> accessibility link", () => {
  it("links to the accessibility statement when configured", () => {
    cy.mount(<Footer pageInfo={{ ...basePageInfo, accessibilityStatement: ".github/ACCESSIBILITY.md" }} />)
    cy.contains("a", "Accessibility").should("have.attr", "href", "/accessibility")
  })

  it("omits the link when no statement is configured", () => {
    cy.mount(<Footer pageInfo={basePageInfo} />)
    cy.contains("a", "Accessibility").should("not.exist")
  })
})
