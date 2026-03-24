import React from "react"
import HomeEventsPanel from "components/home/HomeEventsPanel"
import type { Event } from "lib/types"

const events: Event[] = [
  {
    id: 1,
    name: "Older Event",
    summary: "Earlier session",
    enrol: "",
    content: "",
    enrolKey: "testEnrol",
    instructorKey: "testInstructor",
    start: new Date("2026-01-01T10:00:00.000Z"),
    end: new Date("2026-01-01T12:00:00.000Z"),
    hidden: false,
  },
  {
    id: 2,
    name: "Current Event",
    summary: "Currently selected",
    enrol: "",
    content: "",
    enrolKey: "testEnrol",
    instructorKey: "testInstructor",
    start: new Date("2026-01-03T10:00:00.000Z"),
    end: new Date("2026-01-03T12:00:00.000Z"),
    hidden: false,
  },
]

describe("<HomeEventsPanel />", () => {
  it("renders enrolled events and highlights the active one", () => {
    cy.intercept("PUT", "**/api/user/userEvents/", {
      statusCode: 200,
      body: { userEvents: events, userOnEvents: [], problems: [] },
    }).as("getUserEvents")

    cy.intercept("GET", "**/api/userOnEvent/1", {
      statusCode: 200,
      body: { userOnEvent: { userEmail: "test@test.com", eventId: 1, status: "STUDENT" } },
    }).as("getUserOnEvent1")

    cy.intercept("GET", "**/api/userOnEvent/2", {
      statusCode: 200,
      body: { userOnEvent: { userEmail: "test@test.com", eventId: 2, status: "STUDENT" } },
    }).as("getUserOnEvent2")

    cy.intercept("GET", "**/api/event/2", {
      statusCode: 200,
      body: {
        event: {
          ...events[1],
          EventGroup: [],
          UserOnEvent: [],
        },
      },
    }).as("getActiveEvent")

    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "2")
    })

    cy.mount(<HomeEventsPanel events={events} />)

    cy.wait("@getUserEvents")
    cy.wait("@getUserOnEvent1")
    cy.wait("@getUserOnEvent2")
    cy.wait("@getActiveEvent")
    cy.contains("Your Events").should("be.visible")
    cy.contains("Older Event").should("be.visible")
    cy.contains("Current Event").should("be.visible")
    cy.contains("Browse all events").should("be.visible")
    cy.contains("+ Enrol on event").should("be.visible")
    cy.contains("Current Event").closest("article").should("have.class", "border-cyan-300")
    cy.contains("Current Event").closest("article").contains("button", "Unselect").should("be.visible")
    cy.contains("Older Event").closest("article").contains("button", "Select").should("be.visible")
  })
})
