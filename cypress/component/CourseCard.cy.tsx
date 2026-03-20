import React from "react"
import CourseCard from "components/courses/CourseCard"
import type { Course } from "pages/api/course"

const baseCourse: Course = {
  id: 6,
  externalId: "intro_cpp",
  name: "Intro to C++",
  summary: "Self-paced C++ fundamentals",
  level: "beginner",
  hidden: false,
  language: ["cpp"],
  prerequisites: [],
  tags: ["basics"],
  outcomes: ["Basic syntax"],
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  UserOnCourse: [],
}

describe("<CourseCard />", () => {
  it("renders progress for an enrolled course", () => {
    cy.intercept("GET", "**/api/course/6/progress", {
      statusCode: 200,
      body: { total: 5, completed: 3, sections: [] },
    }).as("getCourseProgress")

    cy.mount(
      <CourseCard
        course={{
          ...baseCourse,
          UserOnCourse: [
            {
              courseId: 6,
              userEmail: "test@test.com",
              status: "ENROLLED",
              startedAt: new Date("2026-01-02"),
              completedAt: null,
            },
          ],
        }}
      />
    )

    cy.wait("@getCourseProgress")
    cy.contains("Progress").should("be.visible")
    cy.contains("3/5").should("be.visible")
    cy.contains("C++").should("be.visible")
    cy.contains("View course").should("be.visible")
  })

  it("renders completed state and label for a completed course", () => {
    cy.intercept("GET", "**/api/course/6/progress", {
      statusCode: 200,
      body: { total: 5, completed: 5, sections: [] },
    }).as("getCompletedCourseProgress")

    cy.mount(
      <CourseCard
        course={{
          ...baseCourse,
          UserOnCourse: [
            {
              courseId: 6,
              userEmail: "test@test.com",
              status: "COMPLETED",
              startedAt: new Date("2026-01-02"),
              completedAt: new Date("2026-01-15"),
            },
          ],
        }}
      />
    )

    cy.wait("@getCompletedCourseProgress")
    cy.contains("Completed on").should("be.visible")
    cy.contains("C++").should("be.visible")
    cy.contains("Outcomes:").should("be.visible")
  })

  it("shows no trackable problems when a course has no progress items", () => {
    cy.intercept("GET", "**/api/course/6/progress", {
      statusCode: 200,
      body: { total: 0, completed: 0, sections: [] },
    }).as("getZeroProgressCourse")

    cy.mount(
      <CourseCard
        course={{
          ...baseCourse,
          UserOnCourse: [
            {
              courseId: 6,
              userEmail: "test@test.com",
              status: "ENROLLED",
              startedAt: new Date("2026-01-02"),
              completedAt: null,
            },
          ],
        }}
      />
    )

    cy.wait("@getZeroProgressCourse")
    cy.contains("No trackable problems").should("be.visible")
  })
})
