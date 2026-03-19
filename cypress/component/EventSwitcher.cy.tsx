import React from "react"
import EventSwitcher from "components/sidebar/EventSwitcher"
import { ContextProvider } from "lib/context/ContextProvider"
import type { PageTemplate } from "lib/pageTemplate"

const pageInfo = {
  title: "Training",
  logo: {
    src: "/logo.svg",
    alt: "Training logo",
  },
} as PageTemplate

const mountSwitcher = () => {
  cy.mount(
    <ContextProvider>
      <EventSwitcher pageInfo={pageInfo} />
    </ContextProvider>
  )
}

describe("<EventSwitcher />", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it("selects event and course learning contexts from one switcher", () => {
    cy.intercept("GET", "**/api/eventFull", {
      statusCode: 200,
      body: {
        events: [
          {
            id: 1,
            name: "Event One",
            summary: "",
            enrol: "",
            content: "",
            enrolKey: "eventKey",
            instructorKey: "instructorKey",
            start: new Date("2026-01-01T10:00:00.000Z"),
            end: new Date("2026-01-01T12:00:00.000Z"),
            hidden: false,
            EventGroup: [],
            UserOnEvent: [],
          },
        ],
      },
    }).as("getEventFull")

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
            UserOnCourse: [
              {
                courseId: 7,
                userEmail: "test@test.com",
                status: "ENROLLED",
                startedAt: new Date("2026-01-02T00:00:00.000Z"),
                completedAt: null,
              },
            ],
          },
        ],
      },
    }).as("getCourses")

    mountSwitcher()

    cy.wait("@getEventFull")
    cy.wait("@getCourses")
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "No active learning context")

    cy.get('[data-cy="toggle-learning-context"]').click()
    cy.get('[data-cy="context-event-option-1"]').click()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "Event One")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("event:1")
    })

    cy.get('[data-cy="toggle-learning-context"]').click()
    cy.get('[data-cy="context-course-option-7"]').click()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "Python Foundations")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("course:python_foundations")
    })

    cy.get('[data-cy="toggle-learning-context"]').click()
    cy.get('[data-cy="clear-learning-context"]').click()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "No active learning context")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.be.null
    })
  })

  it("shows browse links when there are no enrolled courses or events", () => {
    cy.intercept("GET", "**/api/eventFull", {
      statusCode: 200,
      body: { events: [] },
    }).as("getEmptyEventFull")

    cy.intercept("GET", "**/api/course", {
      statusCode: 200,
      body: {
        courses: [],
      },
    }).as("getEmptyCourses")

    mountSwitcher()

    cy.wait("@getEmptyEventFull")
    cy.wait("@getEmptyCourses")
    cy.get('[data-cy="toggle-learning-context"]').click()
    cy.contains("Browse events").should("be.visible")
    cy.get('[data-cy="browse-courses-link"]').should("be.visible").and("have.attr", "href", "/courses")
  })
})
