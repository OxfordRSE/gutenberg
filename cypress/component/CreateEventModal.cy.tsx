import React from "react"
import CreateEventModal from "components/event/CreateEventModal"

describe("<CreateEventModal />", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/course", {
      statusCode: 200,
      body: {
        courses: [
          {
            id: 7,
            externalId: "python_foundations",
            name: "Python Foundations",
            summary: "Learn Python",
            level: "beginner",
            hidden: false,
            language: ["python"],
            prerequisites: [],
            tags: ["basics"],
            outcomes: [],
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            UserOnCourse: [],
          },
          {
            id: 8,
            externalId: "cpp_patterns",
            name: "Modern C++ Patterns",
            summary: "Patterns",
            level: "advanced",
            hidden: false,
            language: ["cpp"],
            prerequisites: [],
            tags: ["patterns"],
            outcomes: [],
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            UserOnCourse: [],
          },
        ],
      },
    }).as("getCourses")
  })

  it("creates a blank event by default", () => {
    const onCreate = cy.stub().as("onCreate")

    cy.mount(
      <CreateEventModal
        show={true}
        onClose={() => undefined}
        onCreate={onCreate}
      />
    )

    cy.get('[data-cy="create-event-start-at"]').clear().type("2026-05-10T14:15")
    cy.get('[data-cy="confirm-create-event"]').should("contain.text", "Create blank event").click()
    cy.get("@onCreate").should("have.been.calledOnceWith", {
      mode: "blank",
      startAt: "2026-05-10T14:15",
    })
  })

  it("requires a course selection before creating from a course blueprint", () => {
    const onCreate = cy.stub().as("onCreate")

    cy.mount(
      <CreateEventModal
        show={true}
        onClose={() => undefined}
        onCreate={onCreate}
      />
    )

    cy.get('[data-cy="create-event-mode-course"]').click()
    cy.wait("@getCourses")
    cy.get('[data-cy="confirm-create-event"]').should("be.disabled")
    cy.get('[data-cy="create-event-course-select"]').select("Python Foundations")
    cy.get('[data-cy="create-event-start-at"]').clear().type("2026-04-01T09:30")
    cy.get('[data-cy="confirm-create-event"]').should("contain.text", "Create from course").click()
    cy.get("@onCreate").should("have.been.calledOnceWith", {
      mode: "course",
      courseId: 7,
      startAt: "2026-04-01T09:30",
    })
  })
})
