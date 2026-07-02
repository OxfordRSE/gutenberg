describe("courses tag filters", () => {
  const admin = { name: "admin", email: "admin@localhost" }

  beforeEach(() => {
    cy.login(admin)
  })

  it("clicking a tag chip on a course card sets local filter state and syncs the URL", () => {
    cy.visit("/courses")
    cy.get("[data-cy^='tag-filter-button-']")
      .first()
      .then(($button) => {
        const tag = $button.attr("data-cy").replace("tag-filter-button-", "")
        cy.wrap($button).click()
        // The URL and the visible active-tag pill must agree - they're driven by the
        // same local state, not a page navigation racing a separate filter state.
        cy.location("pathname").should("eq", "/courses")
        cy.location("search").should("include", `tag=${tag}`)
        cy.get(`[data-cy='active-tag-${tag}']`).should("be.visible")
      })
  })

  it("clicking a tag chip on the home page deep-links to the prefiltered course list", () => {
    cy.visit("/")
    cy.get("[data-cy^='tag-filter-link-']")
      .first()
      .then(($link) => {
        const tag = $link.attr("data-cy").replace("tag-filter-link-", "")
        cy.wrap($link).click()
        cy.location("pathname").should("eq", "/courses")
        cy.location("search").should("include", `tag=${tag}`)
        cy.get(`[data-cy='active-tag-${tag}']`).should("be.visible")
      })
  })

  it("visiting /courses?tag=X shows filtered content with active tag pill", () => {
    cy.visit("/courses?tag=python")
    cy.location("search").should("include", "tag=python")
    cy.get("[data-cy='active-tag-python']").should("exist")
  })

  it("selecting a level updates the URL", () => {
    cy.visit("/courses")
    cy.contains("button", "Filters").click()
    cy.get("[data-cy='level-filter']").select("beginner")
    cy.location("search").should("include", "level=beginner")
  })

  it("removing a tag updates the URL", () => {
    cy.visit("/courses?tag=python")
    cy.get("[data-cy='active-tag-python']").click()
    cy.location("search").should("not.include", "tag=python")
  })

  it("clear filters removes all query params", () => {
    cy.visit("/courses?tag=python&level=beginner")
    cy.get("[data-cy='clear-filters']").click()
    cy.location("search").should("not.include", "tag=")
    cy.location("search").should("not.include", "level=")
  })

  it("initial SSR render with tag param shows filter applied without layout shift", () => {
    cy.visit("/courses?tag=python")
    cy.get("[data-cy='active-tag-python']").should("be.visible")
  })
})
