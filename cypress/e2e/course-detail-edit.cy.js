describe("course detail edit flow", () => {
  beforeEach(() => {
    cy.login({ name: "admin", email: "admin@localhost" })
  })

  it("edits base fields, removes an existing group, adds a new group, saves, and persists after reload", () => {
    const suffix = Date.now()
    const initialCourse = {
      externalId: `course_detail_edit_${suffix}`,
      name: `Course Detail Edit ${suffix}`,
      summary: "Initial summary",
      level: "beginner",
      hidden: false,
      language: ["python"],
      tags: ["basics"],
      outcomes: ["Initial outcome"],
      groups: [
        {
          name: "Initial Group",
          summary: "Initial group summary",
          order: 1,
          items: [],
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
              CourseItem: [],
            },
          ],
          CourseItem: [],
        },
      })

      cy.visit(`/courses/${courseId}#edit`)

      cy.get('[data-cy="textfield-name"]').should("be.visible")
      cy.get("#name").clear().type(`Edited Course ${suffix}`)
      cy.get("#summary").clear().type("Edited summary")
      cy.get("#level").select("advanced")
      cy.get("#languageText").clear().type("cpp")
      cy.get("#tagsText").clear().type("functional")
      cy.get("#outcomesText").clear().type("Updated outcome")
      cy.get("#prerequisitesText").clear().type("Some prior experience")

      cy.contains("button", "Delete Group").click()
      cy.get('[data-cy="textfield-CourseGroup.0.name"]').should("not.exist")
      cy.get('[data-cy="course-groups-required"]').should("be.visible")

      cy.contains("button", "Add Group").click()
      cy.get('[data-cy="course-groups-required"]').should("not.exist")
      cy.get('[data-cy="textfield-CourseGroup.0.name"]').find("input").clear().type("Replacement Group")
      cy.get("#CourseGroup\\.0\\.summary").clear().type("Replacement group summary")
      cy.get('[data-cy="textfield-CourseGroup.0.order"]').find("input").clear().type("2")

      cy.contains("button", "Save Changes").click()

      cy.get("#name").should("have.value", `Edited Course ${suffix}`)
      cy.get("#summary").should("have.value", "Edited summary")
      cy.get("#level").should("have.value", "advanced")
      cy.get("#languageText").should("have.value", "cpp")
      cy.get("#tagsText").should("have.value", "functional")
      cy.get("#outcomesText").should("have.value", "Updated outcome")
      cy.get("#prerequisitesText").should("have.value", "Some prior experience")
      cy.get('[data-cy="textfield-CourseGroup.0.name"]').find("input").should("have.value", "Replacement Group")
      cy.get("#CourseGroup\\.0\\.summary").should("have.value", "Replacement group summary")
      cy.get('[data-cy="textfield-CourseGroup.0.order"]').find("input").should("have.value", "2")

      cy.reload()
      cy.location("hash").should("eq", "#edit")
      cy.get("#name").should("have.value", `Edited Course ${suffix}`)
      cy.get("#summary").should("have.value", "Edited summary")
      cy.get("#level").should("have.value", "advanced")
      cy.get("#languageText").should("have.value", "cpp")
      cy.get("#tagsText").should("have.value", "functional")
      cy.get("#outcomesText").should("have.value", "Updated outcome")
      cy.get("#prerequisitesText").should("have.value", "Some prior experience")
      cy.get('[data-cy="textfield-CourseGroup.0.name"]').find("input").should("have.value", "Replacement Group")
      cy.get("#CourseGroup\\.0\\.summary").should("have.value", "Replacement group summary")
      cy.get('[data-cy="textfield-CourseGroup.0.order"]').find("input").should("have.value", "2")

      cy.request("GET", `/api/course/${courseId}`).then((response) => {
        expect(response.body.course.name).to.eq(`Edited Course ${suffix}`)
        expect(response.body.course.summary).to.eq("Edited summary")
        expect(response.body.course.level).to.eq("advanced")
        expect(response.body.course.language).to.deep.eq(["cpp"])
        expect(response.body.course.tags).to.deep.eq(["functional"])
        expect(response.body.course.outcomes).to.deep.eq(["Updated outcome"])
        expect(response.body.course.prerequisites).to.deep.eq(["Some prior experience"])
        expect(response.body.course.CourseGroup).to.have.length(1)
        expect(response.body.course.CourseGroup[0].name).to.eq("Replacement Group")
        expect(response.body.course.CourseGroup[0].summary).to.eq("Replacement group summary")
        expect(response.body.course.CourseGroup[0].order).to.eq(2)
      })

      cy.request("DELETE", `/api/course/${courseId}`)
    })
  })
})
