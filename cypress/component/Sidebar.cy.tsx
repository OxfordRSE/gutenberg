import React from "react"
import Sidebar from "components/sidebar/Sidebar"
import { ContextProvider } from "lib/context/ContextProvider"
import type { Material } from "lib/material"
import type { EventFull } from "lib/types"
import type { PageTemplate } from "lib/pageTemplate"

const material = {
  markdown: "",
  name: "test",
  type: "Material",
  themes: [
    {
      repo: "HPCu",
      id: "software_architecture_and_design",
      name: "Software Architecture and Design",
      markdown: "",
      type: "Theme",
      summary: "",
      courses: [
        {
          id: "procedural",
          name: "Procedural Programming",
          theme: "software_architecture_and_design",
          markdown: "",
          type: "Course",
          summary: "",
          files: [],
          sections: [
            {
              id: "containers_cpp",
              file: "containers_cpp.md",
              course: "procedural",
              theme: "software_architecture_and_design",
              name: "Containers and Arrays in C++",
              markdown: "",
              index: 0,
              type: "Section",
              dependsOn: [],
              problems: [],
              tags: ["cpp"],
              learningOutcomes: [],
              attribution: [],
            },
          ],
          dependsOn: [],
          learningOutcomes: [],
          attribution: [],
        },
      ],
    },
  ],
} as Material
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
  EventGroup: [
    {
      id: 10,
      name: "Day 1",
      summary: "Introductions",
      location: "Room 1",
      start: new Date("2026-01-01T10:00:00.000Z"),
      end: new Date("2026-01-01T12:00:00.000Z"),
      eventId: 1,
      EventItem: [
        {
          id: 100,
          order: 1,
          section: "HPCu.software_architecture_and_design.procedural.containers_cpp",
          eventGroupId: 10,
        },
      ],
    },
  ],
  UserOnEvent: [],
} as unknown as EventFull

const mountSidebar = () => {
  cy.mount(
    <ContextProvider>
      <Sidebar
        material={material}
        activeEvent={activeEvent}
        sidebarOpen={true}
        handleClose={cy.stub()}
        pageInfo={pageInfo}
      />
    </ContextProvider>
  )
}

describe("<Sidebar />", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it("renders the event sidebar when the learning context is an event", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "event:1")
    })

    cy.intercept("GET", "**/api/event/1", {
      statusCode: 200,
      body: { event: activeEvent },
    }).as("getEvent")

    cy.intercept("GET", "**/api/eventFull", {
      statusCode: 200,
      body: { events: [activeEvent] },
    }).as("getEventFull")

    cy.intercept("GET", "**/api/course", {
      statusCode: 200,
      body: { courses: [] },
    }).as("getCourses")

    cy.intercept("GET", "**/api/event/1/problems", {
      statusCode: 200,
      body: { problems: [] },
    }).as("getEventProblems")

    mountSidebar()

    cy.wait("@getEvent")
    cy.wait("@getEventFull")
    cy.wait("@getCourses")
    cy.wait("@getEventProblems")
    cy.contains("Active Event").should("be.visible")
    cy.contains("Event summary").should("be.visible")
    cy.contains("Containers and Arrays in C++").should("be.visible")
    cy.get('[data-cy="course-section-link-tags"]').within(() => {
      cy.contains("C++").should("be.visible")
    })
    cy.get('[data-cy="toggle-learning-context"]').should("be.visible")
    cy.get('[data-cy="course-sidebar-view"]').should("not.exist")
  })

  it("renders the course sidebar when the learning context is a course", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "course:python_foundations")
    })

    cy.intercept("GET", "**/api/eventFull", {
      statusCode: 200,
      body: { events: [activeEvent] },
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

    cy.intercept("GET", "**/api/course/byExternal/python_foundations", {
      statusCode: 200,
      body: {
        course: {
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
          CourseGroup: [
            {
              id: 1,
              name: "Foundations",
              summary: "Core syntax",
              order: 1,
              courseId: 7,
              CourseItem: [
                {
                  id: 11,
                  order: 1,
                  section: "HPCu.software_architecture_and_design.procedural.containers_cpp",
                  courseId: 7,
                  groupId: 1,
                },
              ],
            },
          ],
          CourseItem: [],
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
      },
    }).as("getCourseByExternal")

    mountSidebar()

    cy.wait("@getEventFull")
    cy.wait("@getCourses")
    cy.wait("@getCourseByExternal")
    cy.get('[data-cy="course-sidebar-view"]').should("be.visible")
    cy.contains("Python Foundations").should("be.visible")
    cy.contains("Foundations").should("be.visible")
    cy.contains("Containers and Arrays in C++").should("be.visible")
  })

  it("renders an empty message when there is no learning context", () => {
    cy.intercept("GET", "**/api/eventFull", {
      statusCode: 200,
      body: { events: [] },
    }).as("getEmptyEventFull")

    cy.intercept("GET", "**/api/course", {
      statusCode: 200,
      body: { courses: [] },
    }).as("getEmptyCourses")

    mountSidebar()

    cy.wait("@getEmptyEventFull")
    cy.wait("@getEmptyCourses")
    cy.contains("No active learning context").should("be.visible")
    cy.get('[data-cy="course-sidebar-view"]').should("not.exist")
  })
})
