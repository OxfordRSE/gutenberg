const defaults = require("../../config/courses.defaults.json")

describe("course defaults config", () => {
  const allowedTags = new Set([
    "programming",
    "software-design",
    "hpc",
    "cluster-computing",
    "parallel",
    "tooling",
    "git",
    "github",
    "docker",
    "workflows",
    "scientific-computing",
    "pybamm",
    "reproducibility",
    "testing",
    "ci",
    "packaging",
    "collaboration",
    "supercomputing",
    "profiling",
    "maths",
    "linear-algebra",
    "optimisation",
    "numerical-methods",
    "cloud-computing",
  ])

  it("uses grouped-only courses with curated tags and real HPCu section refs", () => {
    expect(defaults.courses).to.have.length(26)

    defaults.courses.forEach((course: any) => {
      expect(course.items ?? [], `${course.externalId} should not use ungrouped items`).to.have.length(0)
      expect(course.groups, `${course.externalId} should define groups`).to.be.an("array").and.not.be.empty

      ;(course.tags ?? []).forEach((tag: string) => {
        expect(allowedTags.has(tag), `${course.externalId} tag ${tag} should be in the curated vocabulary`).to.eq(true)
      })

      ;(course.groups ?? []).forEach((group: any) => {
        expect(group.items, `${course.externalId}/${group.name} should have grouped items`).to.be.an("array").and.not.be
          .empty
        ;(group.items ?? []).forEach((item: any) => {
          expect(item.section, `${course.externalId}/${group.name} section ref`).to.match(/^HPCu\.[^.]+\.[^.]+\.[^.]+$/)
        })
      })
    })
  })
})
