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

  it("keeps a URL-seeded tag when an unrelated filter is changed afterwards", () => {
    cy.visit("/courses")
    cy.get("[data-cy^='tag-filter-button-']")
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const tag = dataCy.replace("tag-filter-button-", "")

        cy.get(`[data-cy='tag-filter-button-${tag}']`).click()
        cy.location("search").should("include", `tag=${tag}`)

        // This is the exact regression this test guards against: the tag was
        // previously set via a same-page <Link> navigation that never updated
        // the React filter state, so the next state-driven filter change (the
        // level select here) would silently overwrite the URL and drop it.
        cy.contains("button", "Filters").click()
        cy.get("[data-cy='level-filter']").select("beginner")

        cy.location("search").should("include", `tag=${tag}`)
        cy.location("search").should("include", "level=beginner")
        cy.get(`[data-cy='active-tag-${tag}']`).should("be.visible")
      })
  })

  it("visiting /courses?tag=X shows filtered content with active tag pill", () => {
    cy.visit("/courses?tag=programming")
    cy.location("search").should("include", "tag=programming")
    cy.get("[data-cy='active-tag-programming']").should("exist")
    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Intro to C++").should("be.visible")
  })

  it("selecting a level updates the URL", () => {
    cy.visit("/courses")
    cy.contains("button", "Filters").click()
    cy.get("[data-cy='level-filter']").select("beginner")
    cy.location("search").should("include", "level=beginner")
  })

  it("removing a tag updates the URL", () => {
    cy.visit("/courses?tag=programming")
    cy.get("[data-cy='active-tag-programming']").click()
    cy.location("search").should("not.include", "tag=programming")
  })

  it("clear filters removes all query params", () => {
    cy.visit("/courses?tag=programming&level=beginner")
    cy.get("[data-cy='clear-filters']").click()
    cy.location("search").should("not.include", "tag=")
    cy.location("search").should("not.include", "level=")
  })

  it("initial SSR render with tag param shows filter applied without layout shift", () => {
    cy.visit("/courses?tag=programming")
    cy.get("[data-cy='active-tag-programming']").should("be.visible")
  })

  it("clicking a tag on a single course's detail page deep-links to the prefiltered course list", () => {
    cy.visit("/courses/4") // "Intro to Python", tags: ["programming"]
    cy.get("[data-cy='tag-filter-link-programming']").click()
    cy.location("pathname").should("eq", "/courses")
    cy.location("search").should("include", "tag=programming")
    cy.get("[data-cy='active-tag-programming']").should("be.visible")
    cy.contains("Intro to Python").should("be.visible")
    cy.contains("Intro to C++").should("be.visible")
  })
})
