describe("event coordinator permissions", () => {
  const admin = { name: "admin", email: "admin@localhost" }
  const coordinator = { name: "notOnCourse", email: "notOnCourse@localhost" }
  const other = { name: "instructorOnCourse", email: "instructorOnCourse@localhost" }
  let eventId

  const newEvent = (suffix) => ({
    name: "Coordinator Event " + suffix,
    summary: "summary",
    enrol: "enrol",
    content: "content",
    enrolKey: "enrol_" + suffix,
    instructorKey: "instr_" + suffix,
    hidden: false,
    start: "2026-04-01T09:00:00.000Z",
    end: "2026-04-01T17:00:00.000Z",
  })

  beforeEach(() => {
    const suffix = Date.now()
    cy.login(admin)
    cy.request("POST", "/api/event", newEvent(suffix)).then((res) => {
      eventId = res.body.event.id
      cy.login(coordinator)
      cy.request("POST", `/api/userOnEvent/${eventId}`)
      cy.login(admin)
      cy.request("PUT", `/api/userOnEvent/${eventId}`, {
        userOnEvent: { userEmail: coordinator.email, eventId, status: "COORDINATOR" },
      })
    })
  })

  afterEach(() => {
    if (!eventId) return
    cy.login(admin)
    cy.request({ method: "DELETE", url: `/api/event/${eventId}`, failOnStatusCode: false })
    eventId = undefined
  })

  it("lets a coordinator see the keys and edit their event", () => {
    cy.login(coordinator)
    cy.request("GET", `/api/event/${eventId}`).then((res) => {
      expect(res.body.event.enrolKey).to.be.a("string")
      cy.request("PUT", `/api/event/${eventId}`, {
        event: { ...res.body.event, name: "Edited by coordinator", UserOnEvent: [], EventGroup: [] },
      })
        .its("status")
        .should("eq", 200)
    })
    cy.login(admin)
    cy.request("GET", `/api/event/${eventId}`).its("body.event.name").should("eq", "Edited by coordinator")
  })

  it("forbids a coordinator from deleting the event", () => {
    cy.login(coordinator)
    cy.request({ method: "DELETE", url: `/api/event/${eventId}`, failOnStatusCode: false })
      .its("status")
      .should("eq", 401)
  })

  it("forbids a logged-in non-coordinator from editing", () => {
    cy.login(other)
    cy.request({
      method: "PUT",
      url: `/api/event/${eventId}`,
      failOnStatusCode: false,
      body: { event: { name: "hacked", UserOnEvent: [], EventGroup: [] } },
    })
      .its("status")
      .should("eq", 401)
  })

  it("only an admin can grant the COORDINATOR role", () => {
    cy.login(other)
    cy.request("POST", `/api/userOnEvent/${eventId}`)

    cy.login(coordinator)
    cy.request("GET", `/api/event/${eventId}`).then((res) => {
      cy.request("PUT", `/api/event/${eventId}`, {
        event: { ...res.body.event, EventGroup: [], UserOnEvent: [{ userEmail: other.email, status: "COORDINATOR" }] },
      })
    })
    cy.login(admin)
    cy.request("GET", `/api/event/${eventId}`).then((res) => {
      const row = res.body.event.UserOnEvent.find((u) => u.userEmail === other.email)
      expect(row.status).to.not.eq("COORDINATOR")
    })

    cy.request("GET", `/api/event/${eventId}`).then((res) => {
      cy.request("PUT", `/api/event/${eventId}`, {
        event: { ...res.body.event, EventGroup: [], UserOnEvent: [{ userEmail: other.email, status: "COORDINATOR" }] },
      })
    })
    cy.request("GET", `/api/event/${eventId}`).then((res) => {
      const row = res.body.event.UserOnEvent.find((u) => u.userEmail === other.email)
      expect(row.status).to.eq("COORDINATOR")
    })
  })
})
