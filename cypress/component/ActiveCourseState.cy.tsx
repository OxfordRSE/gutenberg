import React from "react"
import { ContextProvider } from "lib/context/ContextProvider"
import useActiveCourse from "lib/hooks/useActiveCourse"
import useActiveEvent from "lib/hooks/useActiveEvents"

const ActiveStateProbe = () => {
  const [activeCourseExternalId, setActiveCourseExternalId] = useActiveCourse()
  const [activeEvent, setActiveEvent] = useActiveEvent()

  return (
    <div>
      <div data-cy="active-course">{activeCourseExternalId ?? "none"}</div>
      <div data-cy="active-event">{activeEvent?.id ?? "none"}</div>
      <button type="button" data-cy="set-course-python" onClick={() => setActiveCourseExternalId("python_foundations")}>
        Set course python
      </button>
      <button type="button" data-cy="clear-course" onClick={() => setActiveCourseExternalId(undefined)}>
        Clear course
      </button>
      <button type="button" data-cy="set-event-3" onClick={() => setActiveEvent({ id: 3 } as any)}>
        Set event 3
      </button>
      <button type="button" data-cy="clear-event" onClick={() => setActiveEvent(undefined)}>
        Clear event
      </button>
    </div>
  )
}

describe("active course state", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it("hydrates active course from explicit localStorage context", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "course:python_foundations")
    })

    cy.mount(
      <ContextProvider>
        <ActiveStateProbe />
      </ContextProvider>
    )

    cy.get('[data-cy="active-course"]').should("have.text", "python_foundations")
  })

  it("persists active course changes to the unified localStorage key", () => {
    cy.mount(
      <ContextProvider>
        <ActiveStateProbe />
      </ContextProvider>
    )

    cy.get('[data-cy="active-course"]').should("have.text", "none")
    cy.get('[data-cy="set-course-python"]').click()
    cy.get('[data-cy="active-course"]').should("have.text", "python_foundations")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("course:python_foundations")
    })

    cy.get('[data-cy="clear-course"]').click()
    cy.get('[data-cy="active-course"]').should("have.text", "none")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.be.null
    })
  })

  it("switches the unified context from event to course", () => {
    cy.intercept("GET", "**/api/event/3", {
      statusCode: 200,
      body: {
        event: {
          id: 3,
          name: "Test Event",
          summary: "",
          enrol: "",
          content: "",
          enrolKey: "testEnrol",
          instructorKey: "testInstructor",
          start: new Date("2026-01-01T10:00:00.000Z"),
          end: new Date("2026-01-01T12:00:00.000Z"),
          hidden: false,
          EventGroup: [],
          UserOnEvent: [],
        },
      },
    }).as("getEvent")

    cy.mount(
      <ContextProvider>
        <ActiveStateProbe />
      </ContextProvider>
    )

    cy.get('[data-cy="set-event-3"]').click()
    cy.wait("@getEvent")
    cy.get('[data-cy="set-course-python"]').click()
    cy.get('[data-cy="active-event"]').should("have.text", "none")
    cy.get('[data-cy="active-course"]').should("have.text", "python_foundations")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("course:python_foundations")
    })

    cy.get('[data-cy="clear-course"]').click()
    cy.get('[data-cy="active-event"]').should("have.text", "none")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.be.null
    })
  })
})
