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

describe("<Challenge /> submit modal", () => {
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

    // fake session (next-auth)
    cy.login({ name: "Student", email: userEmail })

    // GET /api/problems/:section/:tag
    cy.intercept("GET", "**/api/problems/**", (req) => {
      const { section: s, tag: t } = pathParams(req.url)
      if (s === section && t === tag) {
        req.reply({ statusCode: 200, body: { problem: problemInitial } })
      } else {
        req.reply({ statusCode: 404, body: { error: "Problem not found for this user" } })
      }
    }).as("getProblem")

    let putCount = 0

    cy.intercept("PUT", "**/api/problems/**", (req) => {
      putCount += 1
      const { section: s, tag: t } = pathParams(req.url)
      expect(s).to.eq(section)
      expect(t).to.eq(tag)

      const body = req.body || {}
      expect(body).to.have.property("problem")

      if (putCount === 1) {
        // First PUT: toggle -> return blank fields
        req.reply({
          statusCode: 200,
          body: {
            problem: {
              ...problemInitial,
              complete: true,
              difficulty: 5,
              solution: "",
              notes: "",
            },
          },
        })
      } else if (putCount === 2) {
        // Second PUT: save -> return filled-in fields
        req.reply({
          statusCode: 200,
          body: { problem: problemAfterSave },
        })
      } else {
        // Third PUT: untick -> return incomplete again
        req.reply({
          statusCode: 200,
          body: { problem: problemAfterUncheck },
        })
      }
    }).as("putProblem")

    cy.mount(<Challenge title="Sample Challenge" content={<div>Challenge body</div>} id={tag} section={section} />)

    cy.wait("@getProblem")
  })

  const headerSel = () => cy.get(`#${tag} > div`).first()

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

    // *** TEST-ONLY FIX ***
    // Ensure the modal form also has complete=true before we save
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
    cy.wait("@putProblem").its("request.body.problem.complete").should("eq", false)
    headerSel().should("not.have.class", "bg-green-600")
  })
})
