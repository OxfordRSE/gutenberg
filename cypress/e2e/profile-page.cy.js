describe("profile page", () => {
  const user = { name: "onCourse", email: "onCourse@localhost" }
  const noCourseUser = { name: "notOnCourse", email: "notOnCourse@localhost" }

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

  it("shows the user's courses and events", () => {
    cy.login(user)
    cy.visit("/profile")

    cy.contains("h1", "Profile").should("be.visible")
    cy.contains("h2", "onCourse").should("be.visible")
    cy.contains("onCourse@localhost").should("be.visible")

    cy.get('[data-cy="profile-courses"]').within(() => {
      cy.contains("Software Architecture in C++").should("be.visible")
      cy.contains("Software Architecture in Python").should("not.exist")
    })

    cy.get('[data-cy="profile-completed-courses"]').within(() => {
      cy.contains("Software Architecture in Python").should("be.visible")
    })

    cy.get('[data-cy="profile-events"]').within(() => {
      cy.contains("Introduction to C++").should("be.visible")
      cy.contains("button", "Remove").should("be.visible")
    })
  })

  it("shows a sign-in prompt when logged out", () => {
    clearAuthState()
    cy.visit("/profile")

    cy.contains("h1", "Profile").should("be.visible")
    cy.contains("You need to sign in to view your profile.").should("be.visible")
    cy.contains("button", "Sign in").should("be.visible")
  })

  it("guides users without courses to browse the course catalogue", () => {
    cy.login(noCourseUser)
    cy.visit("/profile")

    cy.contains("h1", "Profile").should("be.visible")
    cy.contains("h2", "notOnCourse").should("be.visible")
    cy.contains("h1", "Your Courses").should("be.visible")
    cy.contains("You have not started any courses yet.").should("be.visible")
    cy.contains("a", "Browse courses").should("have.attr", "href", "/courses")
  })
})
