describe("event detail edit flow", () => {
  beforeEach(() => {
    cy.login({ name: "admin", email: "admin@localhost" })
  })

  it("edits event groups and their material inline on the main event page", () => {
    const suffix = Date.now()
    const initialEvent = {
      name: "Event Detail Edit " + suffix,
      summary: "Initial event summary",
      enrol: "Initial enrol text",
      content: "Initial content",
      enrolKey: "enrol_" + suffix,
      instructorKey: "instructor_" + suffix,
      hidden: false,
      start: "2026-04-01T09:00:00.000Z",
      end: "2026-04-01T17:00:00.000Z",
    }

    cy.request("POST", "/api/event", initialEvent).then((createResponse) => {
      const eventId = createResponse.body.event.id

      cy.request("PUT", "/api/event/" + eventId, {
        event: {
          ...createResponse.body.event,
          UserOnEvent: [],
          EventGroup: [
            {
              id: 0,
              eventId,
              name: "Initial Group",
              summary: "Initial group summary",
              content: "Initial group content",
              location: "Room A",
              start: "2026-04-01T09:00:00.000Z",
              end: "2026-04-01T10:00:00.000Z",
              EventItem: [
                {
                  id: 0,
                  groupId: 0,
                  order: 1,
                  section: "HPCu.software_architecture_and_design.procedural.containers_cpp",
                },
              ],
            },
          ],
        },
      })

      cy.visit("/event/" + eventId + "#edit")

      cy.get('[data-cy="textfield-name"]').should("be.visible")
      cy.get("#name")
        .clear()
        .type("Edited Event " + suffix)
      cy.get("#summary").clear().type("Edited event summary")
      cy.get("#EventGroup\\.0\\.name").clear().type("Edited Group")
      cy.get("#EventGroup\\.0\\.location").clear().type("Room B")
      cy.get("#EventGroup\\.0\\.summary").clear().type("Edited group summary")

      cy.contains("button", "Delete Group").click()
      cy.get('[data-cy="event-groups-required"]').should("be.visible")
      cy.contains("button", "Add Group").click()
      cy.get('[data-cy="event-groups-required"]').should("not.exist")
      cy.get("#EventGroup\\.0\\.name").clear().type("Edited Group")
      cy.get("#EventGroup\\.0\\.location").clear().type("Room B")
      cy.get("#EventGroup\\.0\\.summary").clear().type("Edited group summary")

      cy.contains("button", "Remove").click()
      cy.contains("Containers and Arrays in C++").should("not.exist")

      cy.get('input[placeholder="Choose Sections"]').last().type("Containers")
      cy.contains("li", "Containers and Arrays in C++").click()
      cy.contains("button", "Add Sections").click()
      cy.contains("Containers and Arrays in C++").should("be.visible")

      cy.contains("button", "Save Changes").click()

      cy.get("#name").should("have.value", "Edited Event " + suffix)
      cy.get("#summary").should("have.value", "Edited event summary")
      cy.get("#EventGroup\\.0\\.name").should("have.value", "Edited Group")
      cy.get("#EventGroup\\.0\\.location").should("have.value", "Room B")
      cy.get("#EventGroup\\.0\\.summary").should("have.value", "Edited group summary")
      cy.contains("Containers and Arrays in C++").should("be.visible")

      cy.reload()
      cy.location("hash").should("eq", "#edit")
      cy.get("#name").should("have.value", "Edited Event " + suffix)
      cy.get("#summary").should("have.value", "Edited event summary")
      cy.get("#EventGroup\\.0\\.name").should("have.value", "Edited Group")
      cy.get("#EventGroup\\.0\\.location").should("have.value", "Room B")
      cy.get("#EventGroup\\.0\\.summary").should("have.value", "Edited group summary")
      cy.contains("Containers and Arrays in C++").should("be.visible")

      cy.request("GET", "/api/event/" + eventId).then((response) => {
        expect(response.body.event.name).to.eq("Edited Event " + suffix)
        expect(response.body.event.summary).to.eq("Edited event summary")
        expect(response.body.event.EventGroup).to.have.length(1)
        expect(response.body.event.EventGroup[0].name).to.eq("Edited Group")
        expect(response.body.event.EventGroup[0].location).to.eq("Room B")
        expect(response.body.event.EventGroup[0].summary).to.eq("Edited group summary")
        expect(response.body.event.EventGroup[0].EventItem).to.have.length(1)
        expect(response.body.event.EventGroup[0].EventItem[0].section).to.eq(
          "HPCu.software_architecture_and_design.procedural.containers_cpp"
        )
      })

      cy.request("DELETE", "/api/event/" + eventId)
    })
  })
})
