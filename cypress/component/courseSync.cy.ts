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

  it("reports only the single field that changed", () => {
    const review = reviewCourseDefaults(
      [
        {
          externalId: "single_field_course",
          name: "Single Field Course",
          summary: "Incoming summary",
          level: "beginner",
          hidden: false,
          language: ["python"],
          tags: ["basics"],
          prerequisites: [],
          outcomes: [],
        },
      ],
      [
        {
          externalId: "single_field_course",
          name: "Single Field Course",
          summary: "Old summary",
          level: "beginner",
          hidden: false,
          language: ["python"],
          prerequisites: [],
          tags: ["basics"],
          outcomes: [],
          CourseGroup: [],
          CourseItem: [],
        },
      ]
    )

    expect(review.changedCourses).to.have.length(1)
    expect(review.changedCourses[0].diffs.map((diff) => diff.field)).to.deep.eq(["summary"])
    expect(review.changedCourses[0].diffs[0].current).to.eq("Old summary")
    expect(review.changedCourses[0].diffs[0].incoming).to.eq("Incoming summary")
  })

  it("reports all and only the fields that changed across scalar and structured content", () => {
    const review = reviewCourseDefaults(
      [
        {
          externalId: "multi_field_course",
          name: "Multi Field Course",
          summary: "Incoming summary",
          level: "advanced",
          hidden: true,
          language: ["cpp"],
          tags: ["functional"],
          prerequisites: ["Intro to C++"],
          outcomes: ["Updated outcome"],
          groups: [
            {
              name: "Updated Group",
              summary: "Updated group summary",
              order: 2,
              items: [{ section: "HPCu.software_architecture_and_design.procedural.functions_cpp", order: 1 }],
            },
          ],
          items: [{ section: "HPCu.software_architecture_and_design.procedural.containers_cpp", order: 1 }],
        },
      ],
      [
        {
          externalId: "multi_field_course",
          name: "Multi Field Course",
          summary: "Old summary",
          level: "beginner",
          hidden: false,
          language: ["python"],
          prerequisites: [],
          tags: ["basics"],
          outcomes: ["Old outcome"],
          CourseGroup: [
            {
              name: "Old Group",
              summary: "Old group summary",
              order: 1,
              CourseItem: [{ section: "HPCu.technology_and_tooling.bash_shell.bash", order: 1 }],
            },
          ],
          CourseItem: [],
        },
      ]
    )

    expect(review.changedCourses).to.have.length(1)
    expect(review.changedCourses[0].diffs.map((diff) => diff.field)).to.deep.eq([
      "summary",
      "level",
      "hidden",
      "language",
      "prerequisites",
      "tags",
      "outcomes",
      "groups",
      "items",
    ])
  })
})
