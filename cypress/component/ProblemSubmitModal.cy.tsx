import React from "react"
import Challenge from "components/content/Challenge"

// helpers to pull :section/:tag from the URL
const pathParams = (url: string) => {
  // /api/problems/<section>/<tag>
  const u = new URL(url)
  const parts = u.pathname.split("/").filter(Boolean)
  const idx = parts.findIndex((p) => p === "problems")
  const section = parts[idx + 1]
  const tag = parts[idx + 2]
  return { section, tag }
}

describe("<Challenge /> ProblemSubmitModal", () => {
  const section = "HPCu.software_architecture_and_design.procedural.containers_cpp"
  const tag = "dot_product"
  const userEmail = "testUser@testUser.com"

  const problemInitial = {
    id: 9,
    tag,
    section,
    createdAt: "2024-04-26T13:13:41.602Z",
    userEmail,
    complete: false,
    solution: "",
    difficulty: 5,
    notes: "",
  }

  const problemAfterSave = {
    ...problemInitial,
    complete: true,
    solution: "a",
    difficulty: 7,
    notes: "dot prod",
  }

  const problemAfterUncheck = {
    ...problemInitial,
    complete: false,
    solution: "a",
    difficulty: 7,
    notes: "dot prod",
  }

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })

    cy.login({ name: "Student", email: userEmail })

    // --- In-memory "server" state ---
    let serverProblem = { ...problemInitial }
    let putCount = 0

    // GET /api/problems/:section/:tag -> always return current serverProblem
    cy.intercept("GET", "**/api/problems/**", (req) => {
      const { section: s, tag: t } = pathParams(req.url)
      if (s === section && t === tag) {
        req.reply({ statusCode: 200, body: { problem: serverProblem } })
      } else {
        req.reply({ statusCode: 404, body: { error: "Problem not found for this user" } })
      }
    }).as("getProblem")

    // PUT /api/problems/:section/:tag -> update serverProblem then return it
    cy.intercept("PUT", "**/api/problems/**", (req) => {
      putCount += 1
      const { section: s, tag: t } = pathParams(req.url)
      expect(s).to.eq(section)
      expect(t).to.eq(tag)

      const sent = req.body?.problem || {}

      if (putCount === 1) {
        // Toggle complete -> blank fields
        serverProblem = {
          ...serverProblem,
          complete: true,
          difficulty: 5,
          solution: "",
          notes: "",
        }
      } else if (putCount === 2) {
        // Save from modal -> keep complete true, apply entered values
        serverProblem = {
          ...serverProblem,
          complete: sent.complete, // should remain true unless user unticked
          solution: sent.solution ?? serverProblem.solution,
          difficulty: sent.difficulty ?? serverProblem.difficulty,
          notes: sent.notes ?? serverProblem.notes,
        }
      } else {
        // Untick later
        serverProblem = {
          ...serverProblem,
          complete: false,
        }
      }

      req.reply({ statusCode: 200, body: { problem: serverProblem } })
    }).as("putProblem")

    cy.mount(<Challenge title="Sample Challenge" content={<div>Challenge body</div>} id={tag} section={section} />)
    cy.wait("@getProblem")
  })

  const headerSel = () => cy.get(`#${tag} > div`).first()

  it("clicking the tickbox opens the modal", () => {
    // modal should not be present initially
    cy.get('[data-cy="challenge-edit-modal"]').should("not.exist")

    // click the complete toggle
    cy.get('[data-cy="challenge-complete-toggle"]').click()

    // modal should appear
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")
  })

  it("save button exists in the modal", () => {
    cy.get('[data-cy="challenge-complete-toggle"]').click()
    cy.get('[data-cy="challenge-save"]').should("exist").and("have.attr", "type", "submit")
  })

  it("opens the modal with 'mark as complete' ticked", () => {
    // modal not present initially
    cy.get('[data-cy="challenge-edit-modal"]').should("not.exist")

    // click the complete toggle -> triggers FIRST PUT (complete: true)
    cy.get('[data-cy="challenge-complete-toggle"]').click()

    // ensure the first PUT indeed sent complete: true
    cy.wait("@putProblem").its("request.body.problem.complete").should("eq", true)

    // modal should now be visible
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")

    // the checkbox inside the modal should be ticked
    cy.get('[data-cy="field-complete"] input[type="checkbox"], input[name="complete"]')
      .should("exist")
      .and("be.checked")
    cy.wait(400) // the reason for this is that if there is a GET and the RHF form resets the completion status then this catches this breaking
    cy.get('[data-cy="field-complete"] input[type="checkbox"], input[name="complete"]')
      .should("exist")
      .and("be.checked")
  })

  it("edit button opens the modal with previous values filled", () => {
    // ensure the existing problem (from GET intercept) is loaded
    // and we're currently incomplete
    headerSel().should("not.have.class", "bg-green-600")

    // open the modal via the edit button
    cy.get('[data-cy="challenge-edit-open"]').click()

    // modal visible
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")

    // fields should be pre-filled from problemInitial
    cy.get('[data-cy="field-complete"] input[type="checkbox"], input[name="complete"]').should("not.be.checked")
    cy.get('[data-cy="field-solution"], textarea[name="solution"]').should("have.value", "")
    cy.get('[data-cy="field-notes"], textarea[name="notes"]').should("have.value", "")
  })

  it("edit button does not change completion state", () => {
    headerSel().should("not.have.class", "bg-green-600")
    cy.get('[data-cy="challenge-edit-open"]').click()
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")
    headerSel().should("not.have.class", "bg-green-600") // still incomplete
  })

  it("modal closes when dismiss button is clicked", () => {
    cy.get('[data-cy="challenge-complete-toggle"]').click()
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")

    // close with the modal's X (flowbite adds a button in the header)
    cy.get('[data-cy="challenge-edit-modal"] button[aria-label="Close"]').click()

    cy.get('[data-cy="challenge-edit-modal"]').should("not.exist")
  })

  it("slider can change via direct input", () => {
    cy.get('[data-cy="challenge-edit-open"]').click()
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")
    cy.get('input[name="difficulty"]').should("have.value", "5")

    cy.get('input[name="difficulty"]').invoke("val", 8).trigger("input")

    cy.get('input[name="difficulty"]')
      .invoke("val")
      .then((val) => {
        expect(Number(val)).to.be.greaterThan(5)
      })

    cy.get('[data-cy="challenge-save"]').click()
    cy.wait("@putProblem").its("request.body.problem.difficulty").should("be.greaterThan", 5)
  })

  it("slider can change via keyboard", () => {
    cy.get('[data-cy="challenge-edit-open"]').click()
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")
    cy.get('input[name="difficulty"]').should("have.value", "5")

    cy.get('input[name="difficulty"]').focus().realPress(["ArrowRight", "ArrowRight"])
    cy.get('input[name="difficulty"]').trigger("change")

    cy.get('input[name="difficulty"]')
      .invoke("val")
      .then((val) => {
        expect(Number(val)).to.be.greaterThan(5)
      })

    cy.get('[data-cy="challenge-save"]').click()
    cy.wait("@putProblem").its("request.body.problem.difficulty").should("be.greaterThan", 5)
  })

  // Sort of e2e esque test, testing full functionality:
  it("marks complete -> opens modal -> saves -> header green -> unticks", () => {
    // Initially not complete
    headerSel().should("not.have.class", "bg-green-600")

    // 1) Toggle complete — FIRST PUT (blank fields, difficulty 5)
    cy.get('[data-cy="challenge-complete-toggle"]').click()

    cy.wait("@putProblem")
      .its("request.body.problem")
      .should((p: any) => {
        expect(p.complete).to.eq(true)
        expect(p.difficulty).to.eq(5)
        expect(p.solution).to.eq("")
        expect(p.notes).to.eq("")
      })

    // Modal visible
    cy.get('[data-cy="challenge-edit-modal"]').should("be.visible")

    // Ensure the modal form also has complete=true before we save
    cy.wait(100)
    cy.get('[data-cy="field-complete"] input[type="checkbox"], input[name="complete"]').check({ force: true }) // idempotent: checks if not already checked

    // Fill fields
    cy.get('[data-cy="field-solution"], textarea[name="solution"]').clear().type("a")
    cy.get('[data-cy="field-notes"], textarea[name="notes"]').clear().type("dot prod")
    // If your Slider exposes an input:
    // cy.get('input[name="difficulty"]').clear().type("7")

    // 2) Save — SECOND PUT (complete true + entered values)
    cy.get('[data-cy="challenge-save"]').click()

    cy.wait("@putProblem")
      .its("request.body.problem")
      .should((p: any) => {
        expect(p.complete).to.eq(true)
        expect(p.solution).to.eq("a")
        expect(p.notes).to.eq("dot prod")
      })

    // Modal closed & header green
    cy.get('[data-cy="challenge-edit-modal"]').should("not.exist")
    headerSel().should("have.class", "bg-green-600")

    // 3) Untick — THIRD PUT (complete false)
    cy.get('[data-cy="challenge-complete-toggle"]').click()
    cy.wait(100)
    cy.wait("@putProblem").its("request.body.problem.complete").should("eq", false)
    headerSel().should("not.have.class", "bg-green-600")
  })
})
