describe("course enrolment flow", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const learner = { name: "notOnCourse", email: "notOnCourse@localhost" }

  const createDisposableCourse = (suffix) => {
    const course = {
      externalId: `course_enrolment_${suffix}`,
      name: `Course Enrolment ${suffix}`,
      summary: "Disposable course for enrolment coverage",
      level: "beginner",
      hidden: false,
      language: ["python"],
      tags: ["basics"],
      outcomes: [],
      prerequisites: [],
    }

    cy.login(admin)
    cy.visit("/")
    return cy.request("POST", "/api/course", course).then((response) => response.body.course)
  }

  const deleteDisposableCourse = (courseId) => {
    cy.login(admin)
    cy.visit("/")
    cy.request("DELETE", `/api/course/${courseId}`)
  }

  const clearAuthState = () => {
    cy.clearCookies()
    cy.clearCookie("next-auth.session-token")
    cy.clearCookie("__Secure-next-auth.session-token")
    cy.clearCookie("next-auth.callback-url")
    cy.clearCookie("__Secure-next-auth.callback-url")
    cy.clearCookie("next-auth.csrf-token")
    cy.clearCookie("__Host-next-auth.csrf-token")
    cy.clearLocalStorage()
  }

  it("enrols and unenrols from the detail page and updates course list sections", () => {
    const suffix = Date.now()

    createDisposableCourse(suffix).then((course) => {
      const courseId = course.id
      const courseName = course.name

      cy.login(learner)
      cy.visit(`/courses/${courseId}`)

      cy.contains("Sign in to start this course").should("not.exist")
      cy.contains("button", "Start course").should("be.visible").click()
      cy.contains("button", "Leave course").should("be.visible")
      cy.contains("No trackable problems").should("be.visible")

      cy.request("GET", `/api/course/${courseId}`).then((response) => {
        expect(response.body.course.UserOnCourse).to.have.length(1)
        expect(response.body.course.UserOnCourse[0].status).to.eq("ENROLLED")
      })

      cy.visit("/courses")
      cy.contains("h1", "My Courses")
        .parent()
        .within(() => {
          cy.contains(courseName).should("be.visible")
        })
      cy.contains("h1", "Available Courses")
        .parent()
        .within(() => {
          cy.contains(courseName).should("not.exist")
        })

      cy.visit(`/courses/${courseId}`)
      cy.contains("button", "Leave course").click()
      cy.contains("button", "Start course").should("be.visible")
      cy.contains("Status: Dropped").should("be.visible")

      cy.request("GET", `/api/course/${courseId}`).then((response) => {
        expect(response.body.course.UserOnCourse).to.have.length(1)
        expect(response.body.course.UserOnCourse[0].status).to.eq("DROPPED")
      })

      cy.visit("/courses")
      cy.contains("h1", "Available Courses")
        .parent()
        .within(() => {
          cy.contains(courseName).should("be.visible")
        })
      cy.get("body").then(($body) => {
        if ($body.text().includes("My Courses")) {
          cy.contains("h1", "My Courses")
            .parent()
            .within(() => {
              cy.contains(courseName).should("not.exist")
            })
        }
      })

      deleteDisposableCourse(courseId)
    })
  })

  it("shows sign-in messaging and rejects anonymous enrolment", () => {
    const suffix = Date.now()

    createDisposableCourse(suffix).then((course) => {
      const courseId = course.id

      clearAuthState()
      cy.request({
        url: "/api/auth/session",
        headers: {
          cookie: "",
        },
      })
        .its("body.user")
        .should("not.exist")
      cy.visit(`/courses/${courseId}`)
      cy.contains("button", "Start course").should("not.exist")

      cy.request({
        method: "POST",
        url: `/api/course/${courseId}/enrol`,
        failOnStatusCode: false,
        headers: {
          cookie: "",
        },
      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body.error).to.eq("Unauthorized")
      })

      deleteDisposableCourse(courseId)
    })
  })
})
