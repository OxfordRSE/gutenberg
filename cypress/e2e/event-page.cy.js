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

  it("has page language", () => {
    cy.get('html[lang="en-GB"]').should("exist")
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

  it("loads edit tab from hash", () => {
    cy.wait(500) // wait for initial load to finish
    cy.visit("/event/1#edit")
    cy.get('[data-cy="textfield-name"]').should("be.visible")
    cy.location("hash").should("eq", "#edit")
    cy.contains("button", "Event").click()
    cy.get('[data-cy="textfield-name"]').should("not.be.visible")
    cy.location("hash").should("eq", "")
  })
})
