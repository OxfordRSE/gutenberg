import React from "react"
import HomeCoursesPanel from "components/home/HomeCoursesPanel"
import type { Course } from "pages/api/course"

const courses: Course[] = [
  {
    id: 1,
    externalId: "intro_cpp",
    name: "Intro to C++",
    summary: "Self-paced C++ fundamentals",
    level: "beginner",
    hidden: false,
    language: ["cpp"],
    prerequisites: [],
    tags: ["basics"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [
      {
        courseId: 1,
        userEmail: "test@test.com",
        status: "ENROLLED",
        startedAt: new Date("2026-01-05"),
        completedAt: null,
      },
    ],
  },
  {
    id: 2,
    externalId: "python_data",
    name: "Python for Data",
    summary: "Data workflows in Python",
    level: "intermediate",
    hidden: false,
    language: ["python"],
    prerequisites: [],
    tags: ["data"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
  {
    id: 3,
    externalId: "functional_cpp",
    name: "Functional C++",
    summary: "Higher-order programming in C++",
    level: "advanced",
    hidden: false,
    language: ["cpp"],
    prerequisites: [],
    tags: ["functional"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [
      {
        courseId: 3,
        userEmail: "test@test.com",
        status: "DROPPED",
        startedAt: new Date("2026-01-05"),
        completedAt: null,
      },
    ],
  },
  {
    id: 4,
    externalId: "hidden_course",
    name: "Hidden Course",
    summary: "Should not appear",
    level: "beginner",
    hidden: true,
    language: ["python"],
    prerequisites: [],
    tags: ["hidden"],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
]

describe("<HomeCoursesPanel />", () => {
  it("splits enrolled and available courses and ignores dropped/hidden courses", () => {
    cy.intercept("GET", "**/api/course", {
      statusCode: 200,
      body: { courses },
    }).as("getCourses")

    cy.intercept("GET", "**/api/course/progress", {
      statusCode: 200,
      body: {
        progressByCourseId: {
          1: { total: 4, completed: 2, sections: [] },
        },
      },
    }).as("getMyCourseProgress")

    cy.mount(<HomeCoursesPanel initialCourses={courses} />)

    cy.wait("@getCourses")
    cy.wait("@getMyCourseProgress")
    cy.contains("Continue where you left off").should("be.visible")
    cy.contains("Start a new course").should("be.visible")
    cy.contains("h3", "Continue where you left off")
      .closest("section")
      .within(() => {
        cy.contains("Intro to C++").should("be.visible")
        cy.contains("Python for Data").should("not.exist")
      })
    cy.contains("h3", "Start a new course")
      .closest("section")
      .within(() => {
        cy.contains("Python for Data").should("be.visible")
        cy.contains("Intro to C++").should("not.exist")
      })
    cy.contains("Functional C++").should("not.exist")
    cy.contains("Hidden Course").should("not.exist")
    cy.contains("Browse all 2 courses").should("be.visible")
  })
})
