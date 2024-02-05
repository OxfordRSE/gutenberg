describe("landing page", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("loads", () => {
    cy.contains("Course Events").should("be.visible")
  })

  it("Create event button does not exist", () => {
    cy.contains("Create new Event").should("not.exist")
  })
  it("Delete event button does not exist", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy*="delete-event"]').should("not.exist")
  })

  it("can login", () => {
    cy.get('[data-cy="avatar-not-signed-in"]').should("be.visible")
    const user = {
      name: "admin",
      email: "admin@localhost",
    }
    cy.login(user)
    cy.visit("/")
    cy.intercept("GET", "/api/auth/session").as("getSession")
    cy.get('[data-cy="avatar-admin@localhost"]').should("be.visible")
  })
})
