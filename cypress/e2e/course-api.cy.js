describe("course API", () => {
  it("rejects anonymous create", () => {
    cy.request({
      method: "POST",
      url: "/api/course",
      failOnStatusCode: false,
      body: {
        name: "Anonymous Course",
        summary: "Should fail",
        level: "beginner",
      },
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq("Unauthorized")
    })
  })

  it("rejects non-admin create", () => {
    cy.login({ name: "notOnCourse", email: "notOnCourse@localhost" })
    cy.request({
      method: "POST",
      url: "/api/course",
      failOnStatusCode: false,
      body: {
        name: "Non Admin Course",
        summary: "Should fail",
        level: "beginner",
      },
    }).then((response) => {
      expect(response.status).to.eq(403)
      expect(response.body.error).to.eq("Forbidden")
    })
  })

  it("returns validation errors and generates slug external ids", () => {
    cy.login({ name: "admin", email: "admin@localhost" })

    cy.request({
      method: "POST",
      url: "/api/course",
      failOnStatusCode: false,
      body: {
        name: "",
        summary: "Summary",
        level: "beginner",
      },
    })
      .its("body.error")
      .should("eq", "A name is required.")

    cy.request({
      method: "POST",
      url: "/api/course",
      failOnStatusCode: false,
      body: {
        name: "Generated Slug Course",
        summary: "Summary",
        level: "beginner",
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.course.externalId).to.match(/^generated_slug_course(?:_\d+)?$/)

      cy.request("DELETE", `/api/course/${response.body.course.id}`)
    })
  })
})
