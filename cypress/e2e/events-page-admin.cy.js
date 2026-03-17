describe("admin events page", () => {
  const user = {
    name: "admin",
    email: "admin@localhost",
  }

  const userOnEvent = {
    userOnEvent: {
      userEmail: "admin@localhost",
      eventId: 1,
    },
  }

  beforeEach(() => {
    cy.login(user)
    cy.visit("/events")
  })

  it("can filter events", () => {
    cy.get('[data-cy="show-events-search"]').should("be.visible").click()
    cy.wait(400)
    cy.get('[data-cy="search-input"]').click().type("No events")
    cy.contains("No events match your filter").should("be.visible")
    cy.get('[data-cy="search-input"]').clear()
    cy.contains("No events match your filter").should("not.exist")

    cy.get('[data-cy="search-input"]').click().type("older")
    cy.wait(400)
    cy.contains("older").should("be.visible")
    cy.contains("revenge").should("not.exist")
  })

  it("shows admin event controls", () => {
    cy.contains("Create new Event").should("be.visible")
    cy.get('[data-cy*="delete-event"]').should("be.visible")
    cy.get('[data-cy*="duplicate-event"]').should("be.visible")
  })

  it("admin can enrol with key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testEnrol")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("admin can enrol with instructor key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testInstructor")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("INSTRUCTOR")
    })
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("admin cannot enrol without key", () => {
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("not the enrol key")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-failure-1"]').should("be.visible")
  })

  it("admin can create and delete an event", () => {
    cy.request("GET", "/api/event").its("body").its("events").as("oldres")
    cy.contains("Create new Event").click()

    cy.location("pathname", { timeout: 10000 })
      .should((pathname) => {
        expect(pathname).to.match(/\/event\/\d+$/)
      })
      .then((pathname) => {
        const match = /\/event\/(\d+)$/.exec(pathname)
        expect(match).to.not.be.null
        return Number(match?.[1])
      })
      .then((newEventId) => {
        cy.location("hash").should("eq", "#edit")

        cy.request("GET", "/api/event")
          .its("body")
          .its("events")
          .then((events) => {
            cy.get("@oldres").then((oldres) => {
              expect(events.length).to.eq(oldres.length + 1)
              expect(events.some((e) => e.id === newEventId)).to.be.true
            })
          })

        cy.visit("/events")
        cy.get(`[data-cy="delete-event-${newEventId}"]`, { timeout: 10000 }).should("be.visible").click()
        cy.get('[data-cy="confirm-event-delete"]').should("be.visible").click()
        cy.get('[data-cy="event-deleted-toast"]').should("be.visible")

        cy.request("GET", "/api/event")
          .its("body")
          .its("events")
          .then((res) => {
            cy.get("@oldres").then((oldres) => {
              expect(res.length).to.eq(oldres.length)
            })
          })
      })
  })
})
