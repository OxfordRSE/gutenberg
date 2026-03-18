import { reviewCourseDefaults } from "lib/courseSync"

describe("course sync review", () => {
  it("classifies unchanged, new, and changed default courses", () => {
    const defaults = [
      {
        externalId: "unchanged_course",
        name: "Unchanged Course",
        summary: "Matches database",
        level: "beginner",
        hidden: false,
        language: ["python"],
        tags: ["basics"],
        prerequisites: [],
        outcomes: [],
      },
      {
        externalId: "changed_course",
        name: "Changed Course",
        summary: "Incoming summary",
        level: "advanced",
        hidden: false,
        language: ["cpp"],
        tags: ["functional"],
        prerequisites: ["Intro to C++"],
        outcomes: ["Updated outcome"],
      },
      {
        externalId: "new_course",
        name: "New Course",
        summary: "Does not exist yet",
        level: "intermediate",
        hidden: false,
        language: ["python"],
        tags: ["data"],
        prerequisites: [],
        outcomes: [],
      },
    ]

    const databaseCourses = [
      {
        externalId: "unchanged_course",
        name: "Unchanged Course",
        summary: "Matches database",
        level: "beginner",
        hidden: false,
        language: ["python"],
        prerequisites: [],
        tags: ["basics"],
        outcomes: [],
        CourseGroup: [],
        CourseItem: [],
      },
      {
        externalId: "changed_course",
        name: "Changed Course",
        summary: "Old summary",
        level: "beginner",
        hidden: false,
        language: ["python"],
        prerequisites: [],
        tags: ["basics"],
        outcomes: ["Old outcome"],
        CourseGroup: [],
        CourseItem: [],
      },
    ]

    const review = reviewCourseDefaults(defaults, databaseCourses)

    expect(review.unchanged.map((course) => course.externalId)).to.deep.eq(["unchanged_course"])
    expect(review.newCourses.map((course) => course.externalId)).to.deep.eq(["new_course"])
    expect(review.changedCourses.map((course) => course.externalId)).to.deep.eq(["changed_course"])
    expect(review.changedCourses[0].diffs.map((diff) => diff.field)).to.include.members([
      "summary",
      "level",
      "language",
      "prerequisites",
      "tags",
      "outcomes",
    ])
  })
})
