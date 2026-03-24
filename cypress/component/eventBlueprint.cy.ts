import { buildEventCreateDataFromCourse } from "lib/eventBlueprint"

describe("buildEventCreateDataFromCourse", () => {
  it("maps course groups and items into event groups and items", () => {
    const startAt = new Date("2026-04-01T09:30:00.000Z")
    const course = {
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
          summary: "Core ideas",
          order: 1,
          courseId: 7,
          CourseItem: [
            {
              id: 11,
              courseId: 7,
              groupId: 1,
              order: 1,
              section: "HPCu.software_architecture_and_design.procedural.intro",
            },
            {
              id: 12,
              courseId: 7,
              groupId: 1,
              order: 2,
              section: "HPCu.software_architecture_and_design.procedural.loops",
            },
          ],
        },
      ],
      CourseItem: [
        {
          id: 20,
          courseId: 7,
          groupId: null,
          order: 1,
          section: "HPCu.software_architecture_and_design.procedural.vectors",
        },
      ],
    }

    const eventData = buildEventCreateDataFromCourse(course as any, startAt)
    const createdGroups = eventData.EventGroup?.create as any[]

    expect(eventData.name).to.eq("Python Foundations")
    expect(eventData.summary).to.eq("Learn Python")
    expect(eventData.start).to.deep.eq(startAt)
    expect(eventData.end).to.deep.eq(startAt)
    expect(createdGroups).to.have.length(2)

    const grouped = createdGroups[0]
    expect(grouped.name).to.eq("Foundations")
    expect(grouped.summary).to.eq("Core ideas")
    expect(grouped.start).to.deep.eq(startAt)
    expect(grouped.end).to.deep.eq(startAt)
    expect(grouped.EventItem.create).to.deep.eq([
      { order: 1, section: "HPCu.software_architecture_and_design.procedural.intro" },
      { order: 2, section: "HPCu.software_architecture_and_design.procedural.loops" },
    ])

    const ungrouped = createdGroups[1]
    expect(ungrouped.name).to.eq("Additional material")
    expect(ungrouped.start).to.deep.eq(startAt)
    expect(ungrouped.end).to.deep.eq(startAt)
    expect(ungrouped.EventItem.create).to.deep.eq([
      { order: 1, section: "HPCu.software_architecture_and_design.procedural.vectors" },
    ])
  })
})
