import React from "react"
import { ContextProvider } from "lib/context/ContextProvider"
import useActiveCourse from "lib/hooks/useActiveCourse"
import useActiveEvent from "lib/hooks/useActiveEvents"

const ActiveStateProbe = () => {
  const [activeCourseId, setActiveCourseId] = useActiveCourse()
  const [activeEvent, setActiveEvent] = useActiveEvent()

  return (
    <div>
      <div data-cy="active-course">{activeCourseId ?? "none"}</div>
      <div data-cy="active-event">{activeEvent?.id ?? "none"}</div>
      <button type="button" data-cy="set-course-7" onClick={() => setActiveCourseId(7)}>
        Set course 7
      </button>
      <button type="button" data-cy="clear-course" onClick={() => setActiveCourseId(undefined)}>
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

  it("hydrates active course id from localStorage", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("activeCourse", "12")
    })

    cy.mount(
      <ContextProvider>
        <ActiveStateProbe />
      </ContextProvider>
    )

    cy.get('[data-cy="active-course"]').should("have.text", "12")
  })

  it("persists active course id changes to localStorage", () => {
    cy.mount(
      <ContextProvider>
        <ActiveStateProbe />
      </ContextProvider>
    )

    cy.get('[data-cy="active-course"]').should("have.text", "none")
    cy.get('[data-cy="set-course-7"]').click()
    cy.get('[data-cy="active-course"]').should("have.text", "7")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeCourse")).to.eq("7")
    })

    cy.get('[data-cy="clear-course"]').click()
    cy.get('[data-cy="active-course"]').should("have.text", "none")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeCourse")).to.be.null
    })
  })

  it("keeps active event state intact when active course changes", () => {
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
    cy.get('[data-cy="set-course-7"]').click()
    cy.get('[data-cy="active-event"]').should("have.text", "3")
    cy.get('[data-cy="active-course"]').should("have.text", "7")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("3")
      expect(win.localStorage.getItem("activeCourse")).to.eq("7")
    })

    cy.get('[data-cy="clear-course"]').click()
    cy.get('[data-cy="active-event"]').should("have.text", "3")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("3")
      expect(win.localStorage.getItem("activeCourse")).to.be.null
    })
  })
})
