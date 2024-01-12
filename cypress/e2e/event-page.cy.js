describe("event page no login", () => {
  beforeEach(() => {
    cy.visit("/event/1")
  })

  it("has title", () => {
    cy.contains('[data-cy="title"]', "Introduction to C++").should("be.visible")
  })
})

describe("event page admin", () => {
  beforeEach(() => {
    const user = {
      name: "admin",
      email: "admin@localhost",
    }
    cy.login(user)
    cy.visit("/event/1")
  })

  it("has title", () => {
    cy.contains('[data-cy="title"]', "Introduction to C++").should("be.visible")
  })

  it("can press edit button to go to edit view", () => {
    cy.get('[data-cy="textfield-name"]').should("not.be.visible")
    cy.contains("button", "Edit").should("be.visible")
    cy.contains("button", "Edit").click()
    cy.get('[data-cy="textfield-name"]').should("be.visible")
  })
})
