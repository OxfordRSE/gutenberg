import { findLinks } from "lib/findSectionLinks"
import type { Material } from "lib/material"
import type { CourseByExternal } from "pages/api/course/byExternal/[externalId]"

const material = {
  name: "test",
  markdown: "",
  type: "Material",
  themes: [
    {
      repo: "HPCu",
      id: "software_architecture_and_design",
      name: "Software Architecture and Design",
      markdown: "",
      type: "Theme",
      courses: [
        {
          id: "procedural",
          theme: "software_architecture_and_design",
          name: "Procedural Programming",
          markdown: "",
          type: "Course",
          summary: "",
          files: [],
          dependsOn: [],
          learningOutcomes: [],
          attribution: [],
          sections: [
            {
              id: "intro",
              file: "intro.md",
              course: "procedural",
              theme: "software_architecture_and_design",
              name: "Intro",
              markdown: "",
              dependsOn: [],
              tags: [],
              index: 0,
              type: "Section",
              attribution: [],
              problems: [],
              learningOutcomes: [],
            },
            {
              id: "loops",
              file: "loops.md",
              course: "procedural",
              theme: "software_architecture_and_design",
              name: "Loops",
              markdown: "",
              dependsOn: [],
              tags: [],
              index: 1,
              type: "Section",
              attribution: [],
              problems: [],
              learningOutcomes: [],
            },
            {
              id: "vectors",
              file: "vectors.md",
              course: "procedural",
              theme: "software_architecture_and_design",
              name: "Vectors",
              markdown: "",
              dependsOn: [],
              tags: [],
              index: 2,
              type: "Section",
              attribution: [],
              problems: [],
              learningOutcomes: [],
            },
          ],
        },
      ],
      summary: "",
    },
  ],
} as Material

const theme = material.themes[0]
const course = theme.courses[0]

const activeCourse = {
  id: 7,
  externalId: "python_foundations",
  name: "Python Foundations",
  summary: "",
  level: "beginner",
  hidden: false,
  language: [],
  prerequisites: [],
  tags: [],
  outcomes: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  CourseItem: [],
  CourseGroup: [
    {
      id: 1,
      name: "Group One",
      summary: "",
      order: 1,
      courseId: 7,
      CourseItem: [
        {
          id: 11,
          order: 1,
          section: "HPCu.software_architecture_and_design.procedural.intro",
          courseId: 7,
          groupId: 1,
        },
        {
          id: 12,
          order: 2,
          section: "HPCu.software_architecture_and_design.procedural.loops",
          courseId: 7,
          groupId: 1,
        },
      ],
    },
    {
      id: 2,
      name: "Group Two",
      summary: "",
      order: 2,
      courseId: 7,
      CourseItem: [
        {
          id: 13,
          order: 1,
          section: "HPCu.software_architecture_and_design.procedural.vectors",
          courseId: 7,
          groupId: 2,
        },
      ],
    },
  ],
  UserOnCourse: [],
} as unknown as CourseByExternal

describe("findLinks course navigation", () => {
  it("adds course prev and next links across course groups", () => {
    const links = findLinks(material, theme, course, course.sections[1], undefined, activeCourse)

    const coursePrev = links.find((link) => link.linkedType === "course" && link.direction === "prev")
    const courseNext = links.find((link) => link.linkedType === "course" && link.direction === "next")

    expect(coursePrev?.section).to.eq("Intro")
    expect(courseNext?.section).to.eq("Vectors")
  })

  it("returns to the course page on the final authored course item", () => {
    const links = findLinks(material, theme, course, course.sections[2], undefined, activeCourse)

    const courseNext = links.find((link) => link.linkedType === "course" && link.direction === "next")

    expect(courseNext?.section).to.eq("Return to course")
    expect(courseNext?.url).to.eq("/courses/7")
  })
})
