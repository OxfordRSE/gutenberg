describe("Sign-in page", () => {
  beforeEach(() => {
    cy.visit("/auth/signin")
  })

  it("loads the sign-in page", () => {
    cy.contains("Sign in to Gutenberg").should("be.visible")
  })

  it("always shows GitHub provider", () => {
    // GitHub is enabled by default
    cy.contains("button", "Sign in with GitHub").should("be.visible")
  })

  it("GitHub button has correct styling and icon", () => {
    cy.contains("button", "Sign in with GitHub")
      .should("have.css", "background-color", "rgb(36, 41, 46)") // #24292e
      .find("svg")
      .should("exist")
  })

  it("shows Oxford SSO when enabled in config", () => {
    // Azure AD is enabled in config/auth.yaml with enabled: true
    // and env vars AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID are set
    cy.contains("button", "Sign in with Oxford SSO").should("be.visible")
  })

  it("Oxford SSO button has correct styling and shield icon", () => {
    cy.contains("button", "Sign in with Oxford SSO")
      .should("have.css", "background-color", "rgb(0, 33, 71)") // #002147
      .find("svg")
      .should("exist")
  })

  it("clicking GitHub button initiates OAuth flow", () => {
    cy.intercept("POST", "/api/auth/signin/github").as("githubSignin")
    cy.contains("button", "Sign in with GitHub").click()
    cy.wait("@githubSignin")
    // NextAuth redirects to GitHub OAuth
    cy.url().should("include", "github.com")
  })
})
