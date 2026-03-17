describe("non admin landing page", () => {
  const user = {
    name: "notOnCourse",
    email: "notOnCourse@localhost",
  }

  beforeEach(() => {
    cy.login(user)
    cy.visit("/")
  })

  it("Create event button does not exist", () => {
    cy.contains("Create new Event").should("not.exist")
  })
  it("Delete event button does not exist", () => {
    cy.get('[data-cy*="delete-event"]').should("not.exist")
  })

  it("links to the events page", () => {
    cy.contains("Browse all events").should("be.visible").click()
    cy.location("pathname").should("eq", "/events")
  })
})
