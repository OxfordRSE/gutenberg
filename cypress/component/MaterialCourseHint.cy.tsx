import React from "react"
import { ContextProvider } from "lib/context/ContextProvider"
import { MaterialCourseHintContent } from "components/courses/MaterialCourseHint"
import type { CourseBySection } from "pages/api/course/by-section"

const mountHint = (courses: CourseBySection[], storageValue?: string) => {
  cy.mount(
    <ContextProvider>
      <MaterialCourseHintContent courses={courses} />
    </ContextProvider>
  ).then(() => {
    if (storageValue) {
      cy.window().then((win) => {
        win.localStorage.setItem("activeEvent", storageValue)
      })
    }
  })
}

const baseDates = {
  startedAt: new Date("2026-01-02T00:00:00.000Z"),
  completedAt: new Date("2026-01-05T00:00:00.000Z"),
}

describe("<MaterialCourseHintContent />", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it("shows an enrolled course hint with active-course action", () => {
    const courses: CourseBySection[] = [
      {
        id: 7,
        externalId: "python_foundations",
        name: "Python Foundations",
        UserOnCourse: [
          {
            courseId: 7,
            userEmail: "test@test.com",
            status: "ENROLLED",
            startedAt: baseDates.startedAt,
            completedAt: null,
          },
        ],
      },
    ]

    mountHint(courses)

    cy.contains("This section is part of your course on:").should("be.visible")
    cy.contains("Python Foundations").should("be.visible")
    cy.contains("button", "Select").should("be.visible")
  })

  it("shows the active course wording when the current context matches", () => {
    const courses: CourseBySection[] = [
      {
        id: 7,
        externalId: "python_foundations",
        name: "Python Foundations",
        UserOnCourse: [
          {
            courseId: 7,
            userEmail: "test@test.com",
            status: "COMPLETED",
            startedAt: baseDates.startedAt,
            completedAt: baseDates.completedAt,
          },
        ],
      },
    ]

    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "course:python_foundations")
    })

    cy.mount(
      <ContextProvider>
        <MaterialCourseHintContent courses={courses} />
      </ContextProvider>
    )

    cy.contains("This section is part of your active course on:").should("be.visible")
    cy.contains("button", "Unselect").should("be.visible")
  })

  it("shows a generic multi-course hint and browse link when the section appears in several courses", () => {
    const courses: CourseBySection[] = [
      {
        id: 7,
        externalId: "python_foundations",
        name: "Python Foundations",
        UserOnCourse: [],
      },
      {
        id: 8,
        externalId: "cpp_patterns",
        name: "Modern C++ Patterns",
        UserOnCourse: [],
      },
      {
        id: 9,
        externalId: "hpc_intro",
        name: "HPC Introduction",
        UserOnCourse: [],
      },
    ]

    mountHint(courses)

    cy.contains("This section is part of 3 courses.").should("be.visible")
    cy.contains("Browse courses").should("have.attr", "href", "/courses")
    cy.contains("button", "Select").should("not.exist")
  })

  it("renders nothing when there are no matching courses", () => {
    mountHint([])
    cy.contains("This section is part of").should("not.exist")
  })
})
