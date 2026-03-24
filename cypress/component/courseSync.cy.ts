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
      "group",
      "items",
    ])
  })

  it("splits grouped material diffs per changed group", () => {
    const review = reviewCourseDefaults(
      [
        {
          externalId: "grouped_course",
          name: "Grouped Course",
          summary: "Unchanged summary",
          level: "intermediate",
          hidden: false,
          language: ["cpp"],
          tags: ["programming"],
          prerequisites: [],
          outcomes: [],
          groups: [
            {
              name: "Procedural Programming",
              summary: "Variables and functions in C++.",
              order: 1,
              items: [
                { section: "HPCu.software_architecture_and_design.procedural.variables_cpp", order: 1 },
                { section: "HPCu.software_architecture_and_design.procedural.functions_cpp", order: 2 },
              ],
            },
            {
              name: "Functional Programming",
              summary: "Recursion and higher-order functions in C++.",
              order: 2,
              items: [{ section: "HPCu.software_architecture_and_design.functional.recursion_cpp", order: 1 }],
            },
          ],
        },
      ],
      [
        {
          externalId: "grouped_course",
          name: "Grouped Course",
          summary: "Unchanged summary",
          level: "intermediate",
          hidden: false,
          language: ["cpp"],
          prerequisites: [],
          tags: ["programming"],
          outcomes: [],
          CourseGroup: [
            {
              name: "Procedural Programming",
              summary: "Variables and functions in C++.",
              order: 1,
              CourseItem: [{ section: "HPCu.software_architecture_and_design.procedural.variables_cpp", order: 1 }],
            },
            {
              name: "Functional Programming",
              summary: "Recursion and higher-order functions in C++.",
              order: 2,
              CourseItem: [{ section: "HPCu.software_architecture_and_design.functional.side_effects_cpp", order: 1 }],
            },
          ],
          CourseItem: [],
        },
      ]
    )

    expect(review.changedCourses).to.have.length(1)
    expect(review.changedCourses[0].diffs.map((diff) => diff.id)).to.deep.eq(["group-1", "group-2"])
    expect(review.changedCourses[0].diffs.map((diff) => diff.label)).to.deep.eq([
      "Material group 1: Procedural Programming",
      "Material group 2: Functional Programming",
    ])
    expect(review.changedCourses[0].diffs.every((diff) => diff.field === "group")).to.eq(true)
  })
})
