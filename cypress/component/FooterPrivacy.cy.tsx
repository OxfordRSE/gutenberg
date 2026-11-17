import Footer from "components/Footer"
import type { PageTemplate } from "lib/pageTemplate"

const basePageInfo: PageTemplate = {
  title: "Example",
  logo: { src: "/ox_rse.svg", alt: "Ox RSE" },
  description: "",
  frontpage: { intro: "" },
  footer: "",
}

describe("<Footer /> privacy link", () => {
  it("links to the privacy policy when configured", () => {
    cy.mount(<Footer pageInfo={{ ...basePageInfo, privacyPolicy: "config/oxford-privacy.md" }} />)
    cy.contains("a", "Privacy").should("have.attr", "href", "/privacy")
  })

  it("omits the link when no statement is configured", () => {
    cy.mount(<Footer pageInfo={basePageInfo} />)
    cy.contains("a", "Privacy").should("not.exist")
  })
})
