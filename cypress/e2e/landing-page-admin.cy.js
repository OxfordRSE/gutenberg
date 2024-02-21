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
    cy.visit("/")
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
    cy.get('[data-cy="event-enrol-1"]').should("be.visible")
    cy.get('[data-cy="event-enrol-1"]').click()
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
      console.log(uOnE)
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
    cy.intercept("GET", "/api/auth/session").as("getSession")

    cy.request("GET", "/api/event").its("body").its("events").as("oldres")
    cy.contains("Create new Event").click()

    cy.wait(1000).request("GET", "/api/event").its("body").its("events").as("newres")

    cy.get("@oldres").then((oldres) => {
      cy.get("@newres").then((newres) => {
        // Verify that the second event response has one more item than the first one
        expect(newres.length).to.eq(oldres.length + 1)
        cy.wait(1000).then(() => {
          let deleteId = 0
          newres.map((item) => {
            if (item.id > deleteId) {
              deleteId = item.id
            }
          })
          cy.get('[data-cy="delete-event-' + deleteId + '"]').click()
          cy.get('[data-cy="confirm-event-delete"]').should("be.visible")
          cy.wait(2100).get('[data-cy="confirm-event-delete"]').click()
          cy.get('[data-cy="event-deleted-toast"]').should("be.visible")
          cy.wait(500).request("GET", "/api/event/").its("body").its("events").as("afterdeleteres")
          cy.get("@afterdeleteres").then((res) => {
            // have deleted last added event
            expect(res.length).to.eq(oldres.length)
          })
        })
      })
    })
  })
})
