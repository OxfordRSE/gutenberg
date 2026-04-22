const courseDefaults = require("../../config/courses.defaults.json")

describe("course sync review flow", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const defaultCoursesByExternalId = Object.fromEntries(
    courseDefaults.courses.map((course) => [course.externalId, course])
  )

  const targetCourses = [
    {
      externalId: "course_software_architecture_cpp",
      name: "Software Architecture in C++",
      defaultSummary: defaultCoursesByExternalId.course_software_architecture_cpp.summary,
      editedSummary: "Locally edited C++ architecture summary for sync review",
    },
    {
      externalId: "course_software_architecture_python",
      name: "Software Architecture in Python",
      defaultSummary: defaultCoursesByExternalId.course_software_architecture_python.summary,
      editedSummary: "Locally edited Python architecture summary for sync review",
    },
  ]

  const loginAsAdmin = () => {
    cy.login(admin)
    cy.visit("/")
    cy.request("/api/auth/session").its("body.user.email").should("eq", admin.email)
  }

  const applyDefaults = (externalIds) => {
    loginAsAdmin()
    cy.request("POST", "/api/course/syncDefaults", {
      mode: "apply",
      externalIds,
    })
  }

  const getCourseByExternalId = (externalId) => {
    loginAsAdmin()
    return cy.request("/api/course").then((response) => {
      const course = response.body.courses.find((entry) => entry.externalId === externalId)
      expect(course, `course ${externalId} should exist`).to.exist
      return course
    })
  }

  const updateCourseSummary = (courseId, summary) => {
    loginAsAdmin()
    return cy.request(`/api/course/${courseId}`).then((response) => {
      const course = response.body.course
      return cy.request("PUT", `/api/course/${courseId}`, {
        course: {
          ...course,
          summary,
        },
      })
    })
  }

  it("reviews changed default courses and applies only the selected updates", () => {
    const externalIds = targetCourses.map((course) => course.externalId)

    applyDefaults(externalIds)

    getCourseByExternalId(targetCourses[0].externalId).then((course) => {
      updateCourseSummary(course.id, targetCourses[0].editedSummary)
    })

    getCourseByExternalId(targetCourses[1].externalId).then((course) => {
      updateCourseSummary(course.id, targetCourses[1].editedSummary)
    })

    loginAsAdmin()
    cy.visit("/courses")
    cy.contains("button", "Sync default courses").click()

    cy.get('[data-cy="sync-review-modal"]').should("be.visible")
    cy.get('[data-cy="sync-section-changed"]').within(() => {
      cy.contains(targetCourses[0].name).should("exist")
      cy.contains(targetCourses[1].name).should("exist")
    })
    cy.get(`[data-cy="sync-checkbox-${targetCourses[0].externalId}"]`).should("not.be.checked")
    cy.get(`[data-cy="sync-checkbox-${targetCourses[1].externalId}"]`).should("not.be.checked")
    cy.get(`[data-cy="sync-diff-${targetCourses[0].externalId}-summary"]`)
      .scrollIntoView()
      .within(() => {
        cy.contains(targetCourses[0].editedSummary).should("be.visible")
        cy.contains(targetCourses[0].defaultSummary).should("be.visible")
      })
    cy.get(`[data-cy="sync-diff-${targetCourses[1].externalId}-summary"]`)
      .scrollIntoView()
      .within(() => {
        cy.contains(targetCourses[1].editedSummary).should("be.visible")
        cy.contains(targetCourses[1].defaultSummary).should("be.visible")
      })

    cy.get(`[data-cy="sync-checkbox-${targetCourses[0].externalId}"]`).scrollIntoView().check()
    cy.get('[data-cy="sync-apply-selected"]').click()
    cy.get('[data-cy="sync-review-modal"]').should("not.exist")

    getCourseByExternalId(targetCourses[0].externalId).then((course) => {
      expect(course.summary).to.eq(targetCourses[0].defaultSummary)
    })
    getCourseByExternalId(targetCourses[1].externalId).then((course) => {
      expect(course.summary).to.eq(targetCourses[1].editedSummary)
    })

    loginAsAdmin()
    cy.visit("/courses")
    cy.contains("button", "Sync default courses").click()
    cy.get('[data-cy="sync-review-modal"]').should("be.visible")
    cy.get('[data-cy="sync-section-changed"]').within(() => {
      cy.contains(targetCourses[1].name).should("exist")
      cy.contains(targetCourses[0].name).should("not.exist")
    })

    applyDefaults(externalIds)
  })
})
