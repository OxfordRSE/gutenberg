describe("course access rules", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const learner = { name: "notOnCourse", email: "notOnCourse@localhost" }

  const loginAsAdmin = () => {
    cy.login(admin)
    cy.visit("/")
    cy.request("/api/auth/session").its("body.user.email").should("eq", admin.email)
  }

  const createHiddenCourse = (suffix) => {
    const course = {
      externalId: `hidden_course_access_${suffix}`,
      name: `Hidden Course Access ${suffix}`,
      summary: "Disposable hidden course for access control coverage",
      level: "beginner",
      hidden: true,
      language: ["python"],
      tags: ["hidden"],
      outcomes: [],
      prerequisites: [],
    }

    loginAsAdmin()
    return cy.request("POST", "/api/course", course).then((response) => response.body.course)
  }

  const createPublicCourse = (suffix) => {
    const course = {
      externalId: `public_course_access_${suffix}`,
      name: `Public Course Access ${suffix}`,
      summary: "Disposable public course for access control coverage",
      level: "beginner",
      hidden: false,
      language: ["python"],
      tags: ["basics"],
      outcomes: [],
      prerequisites: [],
    }

    loginAsAdmin()
    return cy.request("POST", "/api/course", course).then((response) => response.body.course)
  }

  const deleteCourse = (courseId) => {
    loginAsAdmin()
    cy.request("DELETE", `/api/course/${courseId}`)
  }

  it("redirects non-admins away from add course and blocks hidden course detail", () => {
    const suffix = Date.now()

    createHiddenCourse(suffix).then((course) => {
      cy.login(learner)

      cy.request({
        url: "/courses/add",
        followRedirect: false,
      }).then((response) => {
        expect(response.status).to.eq(307)
        expect(response.redirectedToUrl).to.eq("http://localhost:3000/courses")
      })

      cy.visit("/courses")
      cy.contains("Add course").should("not.exist")

      cy.visit(`/courses/${course.id}`, { failOnStatusCode: false })
      cy.contains("Page not found").should("be.visible")
      cy.contains("The page you requested does not exist, or you do not have access to it.").should("be.visible")

      deleteCourse(course.id)
    })
  })

  it("lets admins see hidden courses on the list page and access hidden course detail", () => {
    const suffix = Date.now()

    createHiddenCourse(suffix).then((course) => {
      cy.login(admin)

      cy.visit("/courses")
      cy.contains("h1", "Hidden Courses")
        .parent()
        .within(() => {
          cy.contains(course.name).should("be.visible")
        })
      cy.contains("h1", "Available Courses")
        .parent()
        .within(() => {
          cy.contains(course.name).should("not.exist")
        })

      cy.visit(`/courses/${course.id}#edit`)
      cy.contains(course.name).should("be.visible")
      cy.location("hash").should("eq", "#edit")
      cy.contains("button", "Export as JSON").should("be.visible")

      deleteCourse(course.id)
    })
  })

  it("lets non-admins access public course detail", () => {
    const suffix = Date.now()

    createPublicCourse(suffix).then((course) => {
      cy.login(learner)
      cy.visit(`/courses/${course.id}`)
      cy.contains(course.name).should("be.visible")
      cy.contains("Page not found").should("not.exist")

      deleteCourse(course.id)
    })
  })

  it("lets logged-out users access public course detail", () => {
    const suffix = Date.now()

    createPublicCourse(suffix).then((course) => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/courses/${course.id}`)
      cy.contains(course.name).should("be.visible")
      cy.contains("Page not found").should("not.exist")

      deleteCourse(course.id)
    })
  })
})
