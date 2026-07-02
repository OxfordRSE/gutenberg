describe("event stats pages", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const learner = { name: "onCourse", email: "onCourse@localhost" }

  const getColumnTexts = (tableCy, columnIndex) =>
    cy
      .get(`[data-cy="${tableCy}"] tbody tr`)
      .then(($rows) => Cypress._.map($rows, (row) => row.children[columnIndex].innerText.trim()))

  const getColumnNumbers = (tableCy, columnIndex) =>
    getColumnTexts(tableCy, columnIndex).then((values) =>
      values.map((value) => Number(value.match(/-?\d+(?:\.\d+)?/)?.[0] ?? Number.NaN))
    )

  const expectNumbersSorted = (values, direction) => {
    const expected = [...values].sort((left, right) => (direction === "asc" ? left - right : right - left))
    expect(values).to.deep.equal(expected)
  }

  const getSortButton = (tableCy, label) => cy.contains(`[data-cy="${tableCy}"] button`, label)

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

  it("sorts the global event stats table when headers are clicked", () => {
    cy.login(admin)
    cy.visit("/events/stats")

    getSortButton("event-stats-table", "Instructors").click()
    getSortButton("event-stats-table", "Instructors").should("have.attr", "data-sort-direction", "desc")
    getColumnNumbers("event-stats-table", 2).then((descendingValues) => {
      expectNumbersSorted(descendingValues, "desc")

      getSortButton("event-stats-table", "Instructors").click()
      getSortButton("event-stats-table", "Instructors").should("have.attr", "data-sort-direction", "asc")
      getColumnNumbers("event-stats-table", 2).then((ascendingValues) => {
        expectNumbersSorted(ascendingValues, "asc")
        expect(ascendingValues).to.not.deep.equal(descendingValues)
      })
    })
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

  it("sorts the per-event sections and learners tables", () => {
    cy.login(admin)
    cy.visit("/event/1/stats")

    getSortButton("event-section-stats-table", "Problems").click()
    getSortButton("event-section-stats-table", "Problems").should("have.attr", "data-sort-direction", "desc")
    getColumnNumbers("event-section-stats-table", 1).then((descendingSectionValues) => {
      expectNumbersSorted(descendingSectionValues, "desc")

      getSortButton("event-section-stats-table", "Problems").click()
      getSortButton("event-section-stats-table", "Problems").should("have.attr", "data-sort-direction", "asc")
      getColumnNumbers("event-section-stats-table", 1).then((ascendingSectionValues) => {
        expectNumbersSorted(ascendingSectionValues, "asc")
        expect(ascendingSectionValues).to.not.deep.equal(descendingSectionValues)
      })
    })

    getSortButton("event-learner-stats-table", "Solved").click()
    getSortButton("event-learner-stats-table", "Solved").should("have.attr", "data-sort-direction", "desc")
    getColumnNumbers("event-learner-stats-table", 2).then((descendingLearnerValues) => {
      expectNumbersSorted(descendingLearnerValues, "desc")

      getSortButton("event-learner-stats-table", "Solved").click()
      getSortButton("event-learner-stats-table", "Solved").should("have.attr", "data-sort-direction", "asc")
      getColumnNumbers("event-learner-stats-table", 2).then((ascendingLearnerValues) => {
        expectNumbersSorted(ascendingLearnerValues, "asc")
        expect(ascendingLearnerValues).to.not.deep.equal(descendingLearnerValues)
      })
    })
  })

  it("redirects non-admin users away from event stats", () => {
    cy.login(learner)
    cy.visit("/events/stats")
    cy.location("pathname").should("eq", "/events")

    cy.visit("/event/1/stats")
    cy.location("pathname").should("eq", "/events")
  })
})
