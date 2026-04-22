describe("course stats pages", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const learner = { name: "onCourse", email: "onCourse@localhost" }

  it("shows the global course stats page for admins", () => {
    cy.login(admin)
    cy.visit("/courses")

    cy.contains("button", "Stats").should("be.visible").click()
    cy.location("pathname").should("eq", "/courses/stats")

    cy.request("/api/course").its("body.courses").then((courses) => {
      const expectedCourseCount = courses.length
      cy.get('[data-cy="course-stats-table"] tbody tr').should("have.length", expectedCourseCount)
      cy.get('[data-cy="course-stats-total-courses"]').should("contain.text", String(expectedCourseCount))
    })
    cy.get('[data-cy="course-stats-total-learners"]').should("contain.text", "4")
    cy.get('[data-cy="course-stats-total-enrolled"]').should("contain.text", "1")
    cy.get('[data-cy="course-stats-total-completed"]').should("contain.text", "2")
    cy.get('[data-cy="course-stats-total-dropped"]').should("contain.text", "1")
    cy.get('[data-cy="course-stats-most-popular-course"]').should("contain.text", "Software Architecture in C++")
    cy.get('[data-cy="course-stats-most-popular-course"]').should("contain.text", "3 people")
    cy.get('[data-cy="course-stats-table"]').should("contain.text", "Software Architecture in C++")
  })

  it("shows the per-course stats page for admins", () => {
    cy.login(admin)
    cy.visit("/courses/1")

    cy.contains("button", "View stats").should("be.visible").click()
    cy.location("pathname").should("eq", "/courses/1/stats")

    cy.get('[data-cy="course-detail-stats-total-learners"]').should("contain.text", "3")
    cy.get('[data-cy="course-detail-stats-enrolled"]').should("contain.text", "1")
    cy.get('[data-cy="course-detail-stats-completed"]').should("contain.text", "1")
    cy.get('[data-cy="course-detail-stats-dropped"]').should("contain.text", "1")
    cy.get('[data-cy="course-detail-stats-progress"]').should("not.contain.text", "N/A")
    cy.get('[data-cy="course-learner-stats-table"]').should("contain.text", "onCourse@localhost")
    cy.get('[data-cy="course-learner-stats-table"]').should("contain.text", "instructorOnCourse@localhost")
    cy.get('[data-cy="course-learner-stats-table"]').should("contain.text", "notOnCourse@localhost")
    cy.get('[data-cy="course-learner-stats-table"]').should("contain.text", "33.3%")
    cy.get('[data-cy="course-learner-stats-table"]').should("contain.text", "100.0%")
  })

  it("redirects non-admin users away from course stats", () => {
    cy.login(learner)
    cy.visit("/courses/stats")
    cy.location("pathname").should("eq", "/courses")

    cy.visit("/courses/1/stats")
    cy.location("pathname").should("eq", "/courses")
  })
})
