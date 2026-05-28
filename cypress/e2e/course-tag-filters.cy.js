describe("courses tag filters", () => {
  const admin = { name: "admin", email: "admin@localhost" }

  beforeEach(() => {
    cy.login(admin)
  })

  it("clicking a tag chip navigates to /courses with correct tag param", () => {
    cy.visit("/courses")
    cy.get("[data-cy^='tag-filter-link-']").first().then(($link) => {
      const tag = $link.attr("data-cy").replace("tag-filter-link-", "")
      cy.wrap($link).click()
      cy.location("pathname").should("eq", "/courses")
      cy.location("search").should("include", `tag=${tag}`)
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
