describe("course export JSON", () => {
  beforeEach(() => {
    cy.login({ name: "admin", email: "admin@localhost" })
  })

  it("exports JSON that reflects saved course edits", () => {
    const suffix = Date.now()
    const initialCourse = {
      externalId: `course_export_${suffix}`,
      name: `Course Export ${suffix}`,
      summary: "Initial summary",
      level: "beginner",
      hidden: false,
      language: ["python"],
      tags: ["basics"],
      outcomes: ["Initial outcome"],
      prerequisites: ["Initial prerequisite"],
      groups: [
        {
          name: "Initial Group",
          summary: "Initial group summary",
          order: 1,
          items: [{ section: "HPCu.technology_and_tooling.bash_shell.bash", order: 1 }],
        },
      ],
    }

    cy.request("POST", "/api/course", initialCourse).then((createResponse) => {
      const courseId = createResponse.body.course.id

      cy.request("PUT", `/api/course/${courseId}`, {
        course: {
          ...createResponse.body.course,
          CourseGroup: [
            {
              id: 0,
              name: "Initial Group",
              summary: "Initial group summary",
              order: 1,
              courseId,
              CourseItem: [{ id: 0, order: 1, section: "HPCu.technology_and_tooling.bash_shell.bash", courseId }],
            },
          ],
          CourseItem: [],
        },
      })

      cy.visit(`/courses/${courseId}#edit`)

      cy.get("#name").clear().type(`Edited Export Course ${suffix}`)
      cy.get("#summary").clear().type("Edited export summary")
      cy.get("#level").select("advanced")
      cy.get("#languageText").clear().type("cpp")
      cy.get("#tagsText").clear().type("functional")
      cy.get("#outcomesText").clear().type("Updated outcome")
      cy.get("#prerequisitesText").clear().type("Updated prerequisite")

      cy.contains("button", "Delete Group").click()
      cy.contains("button", "Add Group").click()
      cy.get('[data-cy="textfield-CourseGroup.0.name"]').find("input").clear().type("Export Group")
      cy.get("#CourseGroup\\.0\\.summary").clear().type("Export group summary")
      cy.get('[data-cy="textfield-CourseGroup.0.order"]').find("input").clear().type("2")

      cy.contains("button", "Save Changes").click()
      cy.reload()
      cy.location("hash").should("eq", "#edit")

      cy.contains("button", "Export as JSON").click()
      cy.get('[role="dialog"]').should("be.visible")
      cy.get('[role="dialog"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.include(`"externalId": "course_export_${suffix}"`)
          expect(text).to.include(`"name": "Edited Export Course ${suffix}"`)
          expect(text).to.include(`"summary": "Edited export summary"`)
          expect(text).to.include(`"level": "advanced"`)
          expect(text).to.include(`"hidden": false`)
          expect(text).to.include(`"language": [`)
          expect(text).to.include(`"cpp"`)
          expect(text).to.include(`"tags": [`)
          expect(text).to.include(`"functional"`)
          expect(text).to.include(`"outcomes": [`)
          expect(text).to.include(`"Updated outcome"`)
          expect(text).to.include(`"prerequisites": [`)
          expect(text).to.include(`"Updated prerequisite"`)
          expect(text).to.include(`"groups": [`)
          expect(text).to.include(`"name": "Export Group"`)
          expect(text).to.include(`"summary": "Export group summary"`)
          expect(text).to.include(`"order": 2`)
          expect(text).to.not.include("Initial Group")
        })

      cy.request("DELETE", `/api/course/${courseId}`)
    })
  })
})
