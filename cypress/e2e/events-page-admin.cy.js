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
    cy.get('[data-cy="create-event-button"]').click()
    cy.get('[data-cy="confirm-create-event"]').click()

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

  it("admin can create an event from a course blueprint", () => {
    const courseName = `Blueprint Course ${Date.now()}`
    const eventStart = "2026-04-01T09:30"
    let createdCourseId
    let createdEventId

    cy.request("POST", "/api/course", {
      name: courseName,
      summary: "Course used as an event blueprint",
      level: "beginner",
      hidden: false,
      language: ["python"],
      tags: ["basics"],
      prerequisites: [],
      outcomes: [],
    }).then((response) => {
      createdCourseId = response.body.course.id

      return cy.request("PUT", `/api/course/${createdCourseId}`, {
        course: {
          ...response.body.course,
          CourseGroup: [
            {
              id: 0,
              name: "Foundations",
              summary: "Core material",
              order: 1,
              courseId: createdCourseId,
              CourseItem: [
                {
                  id: 0,
                  order: 1,
                  section: "HPCu.software_architecture_and_design.procedural.intro",
                  courseId: createdCourseId,
                  groupId: null,
                },
              ],
            },
            {
              id: 0,
              name: "Advanced",
              summary: "Next steps",
              order: 2,
              courseId: createdCourseId,
              CourseItem: [
                {
                  id: 0,
                  order: 1,
                  section: "HPCu.software_architecture_and_design.procedural.loops",
                  courseId: createdCourseId,
                  groupId: null,
                },
              ],
            },
          ],
          CourseItem: [],
        },
      })
    })

    cy.visit("/events")
    cy.get('[data-cy="create-event-button"]').click()
    cy.get('[data-cy="create-event-mode-course"]').click()
    cy.get('[data-cy="create-event-course-select"]').select(courseName)
    cy.get('[data-cy="create-event-start-at"]').clear().type(eventStart)
    cy.get('[data-cy="confirm-create-event"]').click()

    cy.window().then((win) => {
      cy.wrap(new win.Date(eventStart).toISOString()).as("storedEventStart")
    })

    cy.location("pathname", { timeout: 10000 })
      .should((pathname) => {
        expect(pathname).to.match(/\/event\/\d+$/)
      })
      .then((pathname) => {
        const match = /\/event\/(\d+)$/.exec(pathname)
        expect(match).to.not.be.null
        createdEventId = Number(match?.[1])
        cy.wrap(createdEventId).as("createdEventId")
      })

    cy.location("hash").should("eq", "#edit")
    cy.get('[data-cy="textfield-name"]').find("input").should("have.value", courseName)
    cy.get("#summary").should("have.value", "Course used as an event blueprint")
    cy.get('[data-cy="textfield-EventGroup.0.name"]').find("input").should("have.value", "Foundations")
    cy.get('[data-cy="textfield-EventGroup.1.name"]').find("input").should("have.value", "Advanced")

    cy.get("@storedEventStart").then((storedEventStart) => {
      cy.get("@createdEventId").then((eventId) => {
        cy.request("GET", `/api/event/${eventId}`).then((response) => {
          expect(response.body.event.start).to.eq(storedEventStart)
          expect(response.body.event.end).to.eq(storedEventStart)
          expect(response.body.event.EventGroup).to.have.length(2)
          expect(response.body.event.EventGroup[0].name).to.eq("Foundations")
          expect(response.body.event.EventGroup[0].start).to.eq(storedEventStart)
          expect(response.body.event.EventGroup[0].end).to.eq(storedEventStart)
          expect(response.body.event.EventGroup[0].EventItem[0].section).to.eq(
            "HPCu.software_architecture_and_design.procedural.intro"
          )
          expect(response.body.event.EventGroup[1].name).to.eq("Advanced")
          expect(response.body.event.EventGroup[1].start).to.eq(storedEventStart)
          expect(response.body.event.EventGroup[1].end).to.eq(storedEventStart)
          expect(response.body.event.EventGroup[1].EventItem[0].section).to.eq(
            "HPCu.software_architecture_and_design.procedural.loops"
          )
        })
      })
    })

    cy.get("@createdEventId").then((eventId) => {
      cy.request("DELETE", `/api/event/${eventId}`)
    })
    cy.request("DELETE", `/api/course/${createdCourseId}`)
  })
})
