import { partitionCoursesForListPage } from "lib/courseSections"
import type { Course } from "pages/api/course"

const courses: Course[] = [
  {
    id: 1,
    externalId: "enrolled_course",
    name: "Enrolled Course",
    summary: "Mine",
    level: "beginner",
    hidden: false,
    language: [],
    prerequisites: [],
    tags: [],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [
      {
        courseId: 1,
        userEmail: "test@test.com",
        status: "ENROLLED",
        startedAt: new Date("2026-01-01"),
        completedAt: null,
      },
    ],
  },
  {
    id: 2,
    externalId: "completed_course",
    name: "Completed Course",
    summary: "Mine",
    level: "beginner",
    hidden: false,
    language: [],
    prerequisites: [],
    tags: [],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [
      {
        courseId: 2,
        userEmail: "test@test.com",
        status: "COMPLETED",
        startedAt: new Date("2026-01-01"),
        completedAt: new Date("2026-01-02"),
      },
    ],
  },
  {
    id: 3,
    externalId: "dropped_course",
    name: "Dropped Course",
    summary: "Not mine anymore",
    level: "beginner",
    hidden: false,
    language: [],
    prerequisites: [],
    tags: [],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [
      {
        courseId: 3,
        userEmail: "test@test.com",
        status: "DROPPED",
        startedAt: new Date("2026-01-01"),
        completedAt: null,
      },
    ],
  },
  {
    id: 4,
    externalId: "available_course",
    name: "Available Course",
    summary: "Open",
    level: "beginner",
    hidden: false,
    language: [],
    prerequisites: [],
    tags: [],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
  {
    id: 5,
    externalId: "hidden_course",
    name: "Hidden Course",
    summary: "Admin only",
    level: "beginner",
    hidden: true,
    language: [],
    prerequisites: [],
    tags: [],
    outcomes: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    UserOnCourse: [],
  },
]

describe("partitionCoursesForListPage", () => {
  it("splits my, available, and hidden courses while excluding dropped from my courses", () => {
    const { visibleCourses, hiddenCourses, myCourses, otherCourses } = partitionCoursesForListPage(courses)

    expect(visibleCourses.map((course) => course.name)).to.deep.eq([
      "Enrolled Course",
      "Completed Course",
      "Dropped Course",
      "Available Course",
    ])
    expect(hiddenCourses.map((course) => course.name)).to.deep.eq(["Hidden Course"])
    expect(myCourses.map((course) => course.name)).to.deep.eq(["Enrolled Course", "Completed Course"])
    expect(otherCourses.map((course) => course.name)).to.deep.eq(["Dropped Course", "Available Course"])
  })
})
