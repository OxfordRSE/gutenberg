describe("non admin landing page", () => {
  const user = {
    name: "notOnCourse",
    email: "notOnCourse@localhost",
  }

  const userOnEvent = {
    userOnEvent: {
      userEmail: "notOnCourse@localhost",
      eventId: 1,
    },
  }

  beforeEach(() => {
    cy.visit("/")
    cy.login(user)
    cy.visit("/")
  })

  it("Create event button does not exist", () => {
    cy.contains("Create new Event").should("not.exist")
  })
  it("Delete event button does not exist", () => {
    cy.get('[data-cy*="delete-event"]').should("not.exist")
  })

  it("Can Not Enrol WithOut Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("not the enrol key")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-failure-1"]').should("be.visible")
  })

  it("Can Enrol With Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testEnrol")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    // Then we remove the user just in case we want to run this test again locally
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("Can Enrol With Instructor Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testInstructor")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    // check we are an instructor
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("INSTRUCTOR")
    })
    // Then we remove the user just in case we want to run this test again locally
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })
})
