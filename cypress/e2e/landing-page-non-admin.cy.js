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

  it("Can Request Enrolment Without Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="request-enrol-1"]').should("be.visible")
    cy.get('[data-cy="request-enrol-1"]').click()
    cy.contains("Enrollment request sent.").should("be.visible")
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("REQUEST")
    })
    // Then we remove the user just in case we want to run this test again locally
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })
})
