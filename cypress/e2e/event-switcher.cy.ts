describe("EventSwitcher @ /", () => {
  // test fixtures
  // helpers at top of spec
  const events = [
    { id: 1, name: "Introduction to C++", start: "2025-01-02T10:00:00.000Z" },
    { id: 2, name: "Advanced Python", start: "2025-02-10T09:00:00.000Z" },
    { id: 3, name: "Rust for Pros", start: "2025-03-15T14:00:00.000Z" },
  ]

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })

    const events = [
      { id: 1, name: "Introduction to C++", start: "2025-01-02T10:00:00.000Z" },
      { id: 2, name: "Advanced Python", start: "2025-02-10T09:00:00.000Z" },
      { id: 3, name: "Rust for Pros", start: "2025-03-15T14:00:00.000Z" },
    ]

    const buildEventFull = (id: number) => {
      const base = events.find((e) => e.id === id)
      if (!base) return null
      return {
        id: base.id,
        name: base.name,
        summary: "",
        enrol: "",
        content: "",
        enrolKey: "testEnrol",
        instructorKey: "testInstructor",
        start: base.start,
        end: base.start,
        hidden: false,
        EventGroup: [],
        UserOnEvent: [],
      }
    }

    cy.intercept("GET", "**/api/**", (req) => {
      console.log("[api]", req.url)
    }).as("anyApi")

    cy.intercept("GET", "**/api/eventFull*", {
      statusCode: 200,
      body: { events }, // <- exact shape your hook expects
    }).as("getEventFull")

    // (Optional) detail endpoint if something else calls it on select:
    cy.intercept("GET", /\/api\/event\/\d+(\?.*)?$/, (req) => {
      const id = Number(req.url.match(/\/api\/event\/(\d+)/)![1])
      const eventFull = buildEventFull(id)
      if (eventFull) {
        req.reply({ statusCode: 200, body: { event: eventFull } }) // ← IMPORTANT
      } else {
        req.reply({ statusCode: 404, body: { error: "Event not found" } })
      }
    }).as("getEventById")
    const user = { name: "notOnCourse", email: "notOnCourse@localhost" }
    cy.login(user)
    cy.visit("/")

    // Prove the list call happened and shape is correct
    cy.get('[data-cy="toggle-sidebar"]').should("be.visible").click()
    cy.wait(100)
    cy.wait("@getEventFull").its("response.body.events").should("have.length", 3)
  })

  // Helpers
  const openSwitcher = () => {
    cy.get('section[aria-label="Active learning context selection"]').within(() => {
      cy.get('[data-cy="toggle-learning-context"]')
        .should("be.visible")
        .click()
    })
    cy.get('[data-cy="learning-context-options"]').should("be.visible")
  }

  const pickById = (id: number | string) => {
    cy.get(`[data-cy="context-event-option-${id}"]`).click()
    cy.wait(100)
    cy.get('[data-cy="learning-context-options"]').should("not.exist")
  }

  const pickNone = () => {
    cy.get('[data-cy="clear-learning-context"]').click()
    cy.get('[data-cy="learning-context-options"]').should("not.exist")
  }

  const expectLogoVisible = () => {
    cy.get('section[aria-label="Active learning context selection"] img[alt]').should("be.visible")
  }

  const expectButtonText = (text: "Change") => {
    cy.get('section[aria-label="Active learning context selection"] [data-cy="toggle-learning-context"]').should(
      "contain.text",
      text
    )
  }

  it("starts with no active event selected", () => {
    expectButtonText("Change")
    expectLogoVisible()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "No active learning context")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.be.null
    })
  })

  it("can select an event; display updates and persists", () => {
    openSwitcher()
    pickById(1) // Introduction to C++
    cy.wait("@getEventById")

    expectButtonText("Change")
    expectLogoVisible()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "Introduction to C++")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("event:1")
    })
  })

  it("can change to another event; display updates and persistence follows", () => {
    openSwitcher()
    pickById(1)
    openSwitcher()
    pickById(2)
    expectButtonText("Change")
    expectLogoVisible()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "Advanced Python")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.eq("event:2")
    })
  })

  it("can clear to no active event", () => {
    openSwitcher()
    pickById(3)
    openSwitcher()
    pickNone()

    expectButtonText("Change")
    expectLogoVisible()
    cy.get('[data-cy="learning-context-summary"]').should("contain.text", "No active learning context")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeEvent")).to.be.null
    })
  })
})
