describe("event stats pages", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const learner = { name: "onCourse", email: "onCourse@localhost" }

  it("shows the global event stats page for admins", () => {
    cy.login(admin)
    cy.visit("/events")

    cy.contains("button", "Stats").should("be.visible").click()
    cy.location("pathname").should("eq", "/events/stats")

    cy.get('[data-cy="event-stats-total-events"]').should("contain.text", "2")
    cy.get('[data-cy="event-stats-total-students"]').should("contain.text", "1")
    cy.get('[data-cy="event-stats-total-instructors"]').should("contain.text", "1")
    cy.get('[data-cy="event-stats-total-requests"]').should("contain.text", "0")
    cy.get('[data-cy="event-stats-most-popular-event"]').should("contain.text", "Introduction to C++")
    cy.get('[data-cy="event-stats-most-popular-event"]').should("contain.text", "1 students")
    cy.get('[data-cy="event-stats-table"]').should("contain.text", "Introduction to C++")
  })

  it("shows the per-event stats page for admins", () => {
    cy.login(admin)
    cy.visit("/event/1")

    cy.contains("button", "View stats").should("be.visible").click()
    cy.location("pathname").should("eq", "/event/1/stats")

    cy.get('[data-cy="event-detail-stats-students"]').should("contain.text", "1")
    cy.get('[data-cy="event-detail-stats-instructors"]').should("contain.text", "1")
    cy.get('[data-cy="event-detail-stats-requests"]').should("contain.text", "0")
    cy.get('[data-cy="event-detail-stats-groups"]').should("contain.text", "7")
    cy.get('[data-cy="event-detail-stats-items"]').should("contain.text", "8")
    cy.get('[data-cy="event-detail-stats-progress"]').should("not.contain.text", "N/A")
    cy.get('[data-cy="event-learner-stats-table"]').should("contain.text", "onCourse@localhost")
    cy.get('[data-cy="event-learner-stats-table"]').should("contain.text", "instructorOnCourse@localhost")
    cy.get('[data-cy="event-learner-stats-table"]').should("contain.text", "STUDENT")
    cy.get('[data-cy="event-learner-stats-table"]').should("contain.text", "INSTRUCTOR")
  })

  it("redirects non-admin users away from event stats", () => {
    cy.login(learner)
    cy.visit("/events/stats")
    cy.location("pathname").should("eq", "/events")

    cy.visit("/event/1/stats")
    cy.location("pathname").should("eq", "/events")
  })
})
