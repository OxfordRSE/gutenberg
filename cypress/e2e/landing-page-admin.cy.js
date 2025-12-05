describe("admin landing page", () => {
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
    cy.visit("/")
  })

  it("Load more events works", () => {
    cy.get('[data-cy="load-more-events"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').should("not.exist")
    cy.get('[data-cy="load-more-events"]')
      .click()
      .then(() => {
        cy.get('[data-cy="event-enrol-1"]').should("be.visible")
      })
  })

  it("Create event button exists", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.contains("Create new Event").should("be.visible")
  })

  it("Delete event button exists", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy*="delete-event"]').should("be.visible")
  })

  it("Admin Can Enrol With Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible").click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testEnrol")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    // Then we remove the user just in case we want to run this test again locally
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("Admin Can Enrol With Instructor Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("testInstructor")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-success-1"]').should("be.visible")
    // check we are an instructor
    cy.request("GET", "/api/userOnEvent/1").then((response) => {
      const uOnE = response.body.userOnEvent
      expect(uOnE.status).to.equal("INSTRUCTOR")
    })
    // Then we remove the user just in case we want to run this test again locally
    cy.request("DELETE", "/api/userOnEvent/1", userOnEvent)
  })

  it("Admin Can Not Enrol WithOut Key", () => {
    cy.get('[data-cy="load-more-events"]').click()
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
    cy.get('[data-cy="key-enrol-1"]').should("be.visible")
    cy.get("#enrolKey").type("not the enrol key")
    cy.get('[data-cy="key-enrol-1"]').click()
    cy.get('[data-cy="enrol-failure-1"]').should("be.visible")
  })

  it("admin create/delete event", () => {
    cy.get('[data-cy="load-more-events"]').click()
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

        cy.visit("/")
        cy.get('[data-cy="load-more-events"]').click()
        cy.get(`[data-cy="delete-event-${newEventId}"]`, { timeout: 10000 }).should("be.visible").click()

        cy.get('[data-cy="confirm-event-delete"]').should("be.visible").click()

        cy.get('[data-cy="event-deleted-toast"]').should("be.visible")
        cy.request("GET", "/api/event")
          .its("body")
          .its("events")
          .then((res) => {
            cy.get("@oldres").then((oldres) => {
              // have deleted last added event
              expect(res.length).to.eq(oldres.length)
            })
          })
      })
  })
})
