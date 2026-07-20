import Navbar from "components/navbar/Navbar"
import { Material } from "lib/material"
import * as nextAuth from "next-auth/react"
import * as enableSearchModule from "lib/search/enableSearch"

const material: Material = { markdown: "", name: "test", type: "material", themes: [] }

const renderNavbar = () => (
  <Navbar
    material={material}
    activeEvent={undefined}
    setShowAttribution={cy.stub()}
    setSidebarOpen={cy.stub()}
    sidebarOpen={false}
    showAttribution={false}
  />
)

describe("Navbar search icon", () => {
  beforeEach(() => {
    cy.stub(enableSearchModule, "enableSearch").value(true)
  })

  it("shows the search icon when logged in", () => {
    cy.stub(nextAuth, "useSession").returns({
      data: { user: { email: "admin@localhost" } },
      status: "authenticated",
    } as any)

    cy.mount(renderNavbar())

    cy.get('[aria-label="Search Material"]').should("exist")
  })

  it("hides the search icon when logged out", () => {
    cy.stub(nextAuth, "useSession").returns({
      data: null,
      status: "unauthenticated",
    } as any)

    cy.mount(renderNavbar())

    cy.get('[aria-label="Search Material"]').should("not.exist")
  })
})
