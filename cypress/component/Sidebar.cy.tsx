import React from "react"
import Sidebar from "components/sidebar/Sidebar"
import { ContextProvider } from "lib/context/ContextProvider"
import type { Material } from "lib/material"
import type { EventFull } from "lib/types"
import type { PageTemplate } from "lib/pageTemplate"
import * as learningContextHook from "lib/hooks/useLearningContext"
import * as eventSwitcher from "components/sidebar/EventSwitcher"
import * as eventView from "components/sidebar/EventView"
import * as courseView from "components/sidebar/CourseView"

const material = { markdown: "", name: "test", type: "material", themes: [] } as Material
const pageInfo = {
  title: "Training",
  logo: { src: "/logo.svg", alt: "Training logo" },
} as PageTemplate

const activeEvent = {
  id: 1,
  name: "Active Event",
  summary: "Event summary",
  enrol: "",
  content: "",
  enrolKey: "eventKey",
  instructorKey: "instructorKey",
  start: new Date("2026-01-01T10:00:00.000Z"),
  end: new Date("2026-01-01T12:00:00.000Z"),
  hidden: false,
  EventGroup: [],
  UserOnEvent: [],
} as unknown as EventFull

const mountSidebar = () => {
  cy.mount(
    <ContextProvider>
      <Sidebar material={material} activeEvent={activeEvent} sidebarOpen={true} handleClose={cy.stub()} pageInfo={pageInfo} />
    </ContextProvider>
  )
}

describe("<Sidebar />", () => {
  beforeEach(() => {
    cy.stub(eventSwitcher, "default").callsFake(() => <div data-cy="event-switcher-stub" />)
    cy.stub(eventView, "default").callsFake(() => <div data-cy="event-view-stub" />)
    cy.stub(courseView, "default").callsFake(() => <div data-cy="course-view-stub" />)
  })

  it("renders the event sidebar when the learning context is an event", () => {
    cy.stub(learningContextHook, "default").returns([{ type: "event", id: 1 }, cy.stub()] as any)

    mountSidebar()

    cy.get('[data-cy="event-switcher-stub"]').should("be.visible")
    cy.get('[data-cy="event-view-stub"]').should("be.visible")
    cy.get('[data-cy="course-view-stub"]').should("not.exist")
  })

  it("renders the course sidebar when the learning context is a course", () => {
    cy.stub(learningContextHook, "default").returns([{ type: "course", externalId: "python_foundations" }, cy.stub()] as any)

    mountSidebar()

    cy.get('[data-cy="course-view-stub"]').should("be.visible")
    cy.get('[data-cy="event-view-stub"]').should("not.exist")
  })

  it("renders an empty message when there is no learning context", () => {
    cy.stub(learningContextHook, "default").returns([undefined, cy.stub()] as any)

    mountSidebar()

    cy.contains("No active learning context").should("be.visible")
    cy.get('[data-cy="event-view-stub"]').should("not.exist")
    cy.get('[data-cy="course-view-stub"]').should("not.exist")
  })
})
