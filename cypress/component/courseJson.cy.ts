import { courseToJson, normalizeCourseJson } from "lib/courseJson"

describe("course JSON helpers", () => {
  it("round-trips grouped and ungrouped course content", () => {
    const source = {
      externalId: "intro_cpp",
      name: "Intro to C++",
      summary: "Self-paced C++ introduction",
      level: "beginner",
      hidden: false,
      language: ["cpp"],
      prerequisites: [],
      tags: ["basics"],
      outcomes: ["Functions", "Containers"],
      CourseGroup: [
        {
          name: "Foundations",
          summary: "Core language fundamentals",
          order: 1,
          CourseItem: [
            { section: "HPCu.technology_and_tooling.ide.cpp", order: 2 },
            { section: "HPCu.technology_and_tooling.bash_shell.bash", order: 1 },
          ],
        },
      ],
      CourseItem: [{ section: "HPCu.software_architecture_and_design.procedural.containers_cpp", order: 1, groupId: null }],
    }

    const exported = courseToJson(source)
    const normalized = normalizeCourseJson(exported)

    expect(normalized.base.externalId).to.eq("intro_cpp")
    expect(normalized.base.name).to.eq("Intro to C++")
    expect(normalized.base.language).to.deep.eq(["cpp"])
    expect(normalized.groups).to.have.length(1)
    expect(normalized.groups[0].items.map((item) => item.section)).to.deep.eq([
      "HPCu.technology_and_tooling.bash_shell.bash",
      "HPCu.technology_and_tooling.ide.cpp",
    ])
    expect(normalized.items.map((item) => item.section)).to.deep.eq([
      "HPCu.software_architecture_and_design.procedural.containers_cpp",
    ])
  })
})
