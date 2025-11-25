import { Tabs } from "flowbite-react"
import { useEffect, useRef, useState } from "react"
import EventViewPane from "components/event/EventViewPane"
import { Material } from "lib/material"
import { Event } from "lib/types"
import * as nextAuth from "next-auth/react"
import * as activeEventHook from "lib/hooks/useActiveEvents"
import * as userOnEventHook from "lib/hooks/useUserOnEvent"
import * as eventCommentThreads from "components/event/EventCommentThreads"
import * as eventProblems from "components/event/EventProblems"
import * as eventActions from "components/timeline/EventActions"

const baseEvent: Event = {
  id: 1,
  name: "Test Event",
  summary: "Summary",
  enrol: "",
  content: "Event content",
  enrolKey: null,
  instructorKey: null,
  start: new Date("2024-01-01T00:00:00Z"),
  end: new Date("2024-01-01T01:00:00Z"),
  hidden: false,
} as Event

const material: Material = { markdown: "", name: "test", type: "material", themes: [] }

const eventWithRelations = {
  ...baseEvent,
  EventGroup: [],
  UserOnEvent: [],
} as any

const EventTabsHarness = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const tabsRef = useRef<{ setActiveTab: (idx: number) => void } | null>(null)

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "")
      const idx = hash === "edit" ? 1 : 0
      setActiveTabIndex(idx)
      tabsRef.current?.setActiveTab(idx)
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [])

  const handleTabChange = (idx: number) => {
    setActiveTabIndex(idx)
    if (typeof window === "undefined") return
    const basePath = `${window.location.pathname}${window.location.search}`
    const nextUrl = idx === 1 ? `${basePath}#edit` : basePath
    if (window.location.href === `${window.location.origin}${nextUrl}`) return
    window.history.pushState(null, "", nextUrl)
  }

  return (
    <Tabs.Group style="underline" ref={tabsRef} onActiveTabChange={handleTabChange}>
      <Tabs.Item active={activeTabIndex === 0} title="Event">
        <EventViewPane
          event={baseEvent}
          eventWithRelations={eventWithRelations}
          material={material}
          isAdmin={true}
          isInstructor={true}
        />
      </Tabs.Item>
      <Tabs.Item active={activeTabIndex === 1} title="Edit">
        <div data-cy="edit-tab-content">Edit pane</div>
      </Tabs.Item>
    </Tabs.Group>
  )
}

describe("Event tabs hash sync", () => {
  beforeEach(() => {
    cy.stub(nextAuth, "useSession").returns({
      data: { user: { email: "admin@localhost" } },
      status: "authenticated",
    } as any)
    cy.stub(userOnEventHook, "useUserOnEvent").returns({
      userOnEvent: undefined,
      error: undefined,
      mutate: cy.stub(),
    } as any)
    cy.stub(activeEventHook, "default").returns([undefined, cy.stub()] as any)
    cy.stub(eventCommentThreads, "default").callsFake(() => <div data-cy="event-comment-threads" />)
    cy.stub(eventProblems, "default").callsFake(() => <div data-cy="event-problems" />)
    cy.stub(eventActions, "default").callsFake(() => <div data-cy="event-actions" />)
  })

  it("honors hash on load, updates hash on tab change, and renders panes", () => {
    cy.window().then((win) => {
      win.history.replaceState(null, "", "/event/123#edit")
    })

    cy.mount(<EventTabsHarness />)

    cy.get('[data-cy="edit-tab-content"]').should("be.visible")
    cy.get('[data-cy="event-view-pane"]').should("not.be.visible")
    cy.window().its("location.hash").should("eq", "#edit")

    cy.contains("Event").click()
    cy.get('[data-cy="event-view-pane"]').should("be.visible").and("contain.text", "Test Event")
    cy.get('[data-cy="edit-tab-content"]').should("not.be.visible")
    cy.window().its("location.hash").should("eq", "")

    cy.contains("Edit").click()
    cy.get('[data-cy="edit-tab-content"]').should("be.visible")
    cy.window().its("location.hash").should("eq", "#edit")
  })
})
