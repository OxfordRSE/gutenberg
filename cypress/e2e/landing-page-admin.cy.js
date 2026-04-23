describe("admin landing page", () => {
  const user = {
    name: "admin",
    email: "admin@localhost",
  }

  beforeEach(() => {
    cy.login(user)
    cy.visit("/")
  })

  it("links to the events page", () => {
    cy.contains("Browse all events").should("be.visible").click()
    cy.location("pathname").should("eq", "/events")
  })

  it("Create event button exists", () => {
    cy.contains("Create new Event").should("not.exist")
  })

  it("Delete event button exists", () => {
    cy.get('[data-cy*="delete-event"]').should("not.exist")
  })
})
