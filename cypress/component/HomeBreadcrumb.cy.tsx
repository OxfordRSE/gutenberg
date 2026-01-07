// cypress/component/HomeBreadcrumb.cy.tsx
import { HomeBreadcrumb } from "components/navbar/HomeBreadcrumb"
import type { PageTemplate } from "lib/pageTemplate"

describe("<HomeBreadcrumb />", () => {
  it("renders a logo when pageInfo has logo", () => {
    const pageInfo: PageTemplate = {
      title: "Example",
      logo: { src: "/ox_rse.svg", alt: "Ox RSE" },
      description: "",
      frontpage: { intro: "" },
      footer: "",
    }

    cy.mount(<HomeBreadcrumb pageInfo={pageInfo} />)

    cy.get("a").should("have.attr", "href", "/")
    cy.get("img").should("have.attr", "src", "/ox_rse.svg").and("have.attr", "alt", "Home")
  })

  it("renders text Home when no logo", () => {
    const pageInfo: PageTemplate = {
      title: "Example",
      // @ts-expect-error simulate missing logo
      logo: undefined,
      description: "",
      frontpage: { intro: "" },
      footer: "",
    }

    cy.mount(<HomeBreadcrumb pageInfo={pageInfo} />)

    cy.get("a").should("have.attr", "href", "/")
    cy.contains("Home").should("exist")
  })

  it("renders text Home when no pageInfo", () => {
    cy.mount(<HomeBreadcrumb />)

    cy.get("a").should("have.attr", "href", "/")
    cy.contains("Home").should("exist")
  })
})
