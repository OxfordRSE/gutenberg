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
    cy.intercept("GET", "**/api/event/1", {
      statusCode: 200,
      body: {
        event: {
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
      },
    }).as("getEventOne")

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
    cy.wait("@getEventOne")
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

  it("shows all enrolled events and only enrolled or completed courses in the chooser", () => {
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
            enrolKey: "eventKey1",
            instructorKey: "instructorKey1",
            start: new Date("2026-01-01T10:00:00.000Z"),
            end: new Date("2026-01-01T12:00:00.000Z"),
            hidden: false,
            EventGroup: [],
            UserOnEvent: [],
          },
          {
            id: 2,
            name: "Event Two",
            summary: "",
            enrol: "",
            content: "",
            enrolKey: "eventKey2",
            instructorKey: "instructorKey2",
            start: new Date("2026-01-03T10:00:00.000Z"),
            end: new Date("2026-01-03T12:00:00.000Z"),
            hidden: false,
            EventGroup: [],
            UserOnEvent: [],
          },
        ],
      },
    }).as("getMultipleEventFull")

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
            UserOnCourse: [
              {
                courseId: 8,
                userEmail: "test@test.com",
                status: "COMPLETED",
                startedAt: new Date("2026-01-02T00:00:00.000Z"),
                completedAt: new Date("2026-01-05T00:00:00.000Z"),
              },
            ],
          },
          {
            id: 9,
            externalId: "public_course",
            name: "Public Course",
            summary: "Not enrolled",
            level: "beginner",
            hidden: false,
            language: [],
            prerequisites: [],
            tags: [],
            outcomes: [],
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            UserOnCourse: [],
          },
          {
            id: 10,
            externalId: "dropped_course",
            name: "Dropped Course",
            summary: "Dropped",
            level: "intermediate",
            hidden: false,
            language: [],
            prerequisites: [],
            tags: [],
            outcomes: [],
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            UserOnCourse: [
              {
                courseId: 10,
                userEmail: "test@test.com",
                status: "DROPPED",
                startedAt: new Date("2026-01-02T00:00:00.000Z"),
                completedAt: null,
              },
            ],
          },
        ],
      },
    }).as("getMixedCourses")

    mountSwitcher()

    cy.wait("@getMultipleEventFull")
    cy.wait("@getMixedCourses")
    cy.get('[data-cy="toggle-learning-context"]').click()

    cy.get('[data-cy="context-event-option-1"]').should("contain.text", "Event One")
    cy.get('[data-cy="context-event-option-2"]').should("contain.text", "Event Two")
    cy.get('[data-cy="context-course-option-7"]').should("contain.text", "Python Foundations")
    cy.get('[data-cy="context-course-option-8"]').should("contain.text", "Modern C++ Patterns")
    cy.contains("Public Course").should("not.exist")
    cy.contains("Dropped Course").should("not.exist")
  })
})
