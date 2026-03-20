describe("non admin events page", () => {
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
    cy.login(user)
    cy.visit("/events")
  })

  it("does not show admin event controls", () => {
    cy.contains("Create new Event").should("not.exist")
    cy.get('[data-cy*="delete-event"]').should("not.exist")
    cy.get('[data-cy*="duplicate-event"]').should("not.exist")
  })

  it("can filter events", () => {
    cy.get('[data-cy="show-events-search"]').should("be.visible").click()
    cy.wait(400)
    cy.get('[data-cy="search-input"]').click().type("No events")
    cy.contains("No events match your filter").should("be.visible")
    cy.get('[data-cy="search-input"]').clear()
    cy.contains("No events match your filter").should("not.exist")

    cy.get('[data-cy="search-input"]').click().type("older")
    cy.wait(400)
    cy.contains("older").should("be.visible")
    cy.contains("revenge").should("not.exist")
  })

  it("cannot enrol without key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("not the enrol key")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-failure-1"]').should("be.visible")
  })

  it("can enrol with key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testEnrol")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("can enrol with instructor key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testInstructor")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("INSTRUCTOR")
    })
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("can request enrolment without key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="request-enrol-1"]').should("be.visible")
    cy.get('[data-cy="request-enrol-1"]').click()
    cy.contains("Enrollment request sent.").should("be.visible")
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("REQUEST")
    })
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })
})
