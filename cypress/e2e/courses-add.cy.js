describe("add course flows", () => {
  beforeEach(() => {
    cy.login({ name: "admin", email: "admin@localhost" })
  })

  it("shows validation on the short form", () => {
    cy.visit("/courses/add")
    cy.contains("button", "Create course").click()
    cy.contains("A name is required.").should("be.visible")
    cy.contains("A summary is required.").should("be.visible")
    cy.contains("A level is required.").should("be.visible")
  })

  it("creates a course from the short form and redirects to edit", () => {
    const uniqueName = `Short Form Course ${Date.now()}`

    cy.visit("/courses/add")
    cy.get('#name').type(uniqueName)
    cy.get('#summary').type("Created from the short form")
    cy.get('#level').select("beginner")
    cy.get('#languageText').type("python")
    cy.get('#tagsText').type("basics")
    cy.contains("button", "Create course").click()

    cy.location("pathname", { timeout: 10000 })
      .should((pathname) => {
        expect(pathname).to.match(/\/courses\/\d+$/)
      })
      .then((pathname) => {
        const match = /\/courses\/(\d+)$/.exec(pathname)
        expect(match).to.not.be.null
        return Number(match[1])
      })
      .then((courseId) => {
        cy.location("hash").should("eq", "#edit")
        cy.request("GET", `/api/course/${courseId}`).its("body.course.name").should("eq", uniqueName)
        cy.request("DELETE", `/api/course/${courseId}`)
      })
  })

  it("creates a course from JSON", () => {
    const suffix = Date.now()
    const courseJson = {
      externalId: `json_import_course_${suffix}`,
      name: `JSON Import Course ${suffix}`,
      summary: "Imported from JSON",
      level: "beginner",
      hidden: false,
      language: ["cpp"],
      tags: ["basics"],
      groups: [
        {
          name: "Foundations",
          summary: "Core language fundamentals",
          order: 1,
          items: [{ section: "HPCu.technology_and_tooling.bash_shell.bash", order: 1 }],
        },
      ],
      items: [{ section: "HPCu.software_architecture_and_design.procedural.containers_cpp", order: 1 }],
    }

    cy.visit("/courses/add")
    cy.get("textarea").last().clear().type(JSON.stringify(courseJson, null, 2), {
      parseSpecialCharSequences: false,
    })
    cy.contains("button", "Create from JSON").click()

    cy.location("pathname", { timeout: 10000 })
      .should((pathname) => {
        expect(pathname).to.match(/\/courses\/\d+$/)
      })
      .then((pathname) => {
        const match = /\/courses\/(\d+)$/.exec(pathname)
        expect(match).to.not.be.null
        return Number(match[1])
      })
      .then((courseId) => {
        cy.location("hash").should("eq", "#edit")
        cy.contains("button", "Export as JSON").click()
        cy.contains("Course JSON").should("be.visible")
        cy.contains(courseJson.name).should("be.visible")
        cy.request("GET", `/api/course/${courseId}`).then((response) => {
          expect(response.body.course.CourseGroup).to.have.length(1)
          expect(response.body.course.CourseItem).to.have.length(1)
        })
        cy.request("DELETE", `/api/course/${courseId}`)
      })
  })
})
