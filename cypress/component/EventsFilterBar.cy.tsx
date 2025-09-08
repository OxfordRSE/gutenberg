import React from "react"
import EventsFilterBar from "components/timeline/EventsFilterBar"

describe("<EventsFilterBar /> (data-cy)", () => {
  it("starts collapsed, expands on click", () => {
    cy.mount(
      <EventsFilterBar value="" onChange={cy.stub().as("onChange")} onDebouncedChange={cy.stub().as("onDebounced")} />
    )

    cy.get('[data-cy="show-events-search"]').should("exist")
    cy.get('[data-cy="search-input"]').should("not.be.visible")
    cy.get('[data-cy="show-events-search"]').click()
    cy.wait(800)
    // Now the input is visible
    cy.get('[data-cy="search-input"]').should("be.visible")
  })

  // it.only("calls onChange immediately and onDebouncedChange after delay", () => {
  //   cy.clock()

  //   const onChange = cy.stub().as("onChange")
  //   const onDebounced = cy.stub().as("onDebounced")

  //   cy.mount(<EventsFilterBar value="" onChange={onChange} onDebouncedChange={onDebounced} delay={200} />)

  //   // Open (use aria-label for robustness)
  //   cy.get('[data-cy="show-events-search"]').should("exist")
  //   cy.wait(800)
  //   cy.get('[data-cy="search-input"]').should("be.visible").type("hello")

  //   // onChange fires per keystroke
  //   cy.get("@onChange").should("have.callCount", 5)

  //   // Debounced fires after 200ms
  //   cy.tick(199)
  //   cy.get("@onDebounced").should("have.callCount", 0)
  //   cy.tick(1)
  //   cy.get("@onDebounced").should("have.been.calledWith", "hello")
  // })

  // it("clear button appears only when there is text, clears and refocuses", () => {
  //   cy.mount(
  //     <EventsFilterBar value="" onChange={cy.stub().as("onChange")} onDebouncedChange={cy.stub().as("onDebounced")} />
  //   )

  //   cy.get('[data-cy="show-events-search"]').should("exist")

  //   cy.get('[data-cy="search-input"]').should("be.visible").type("abc")

  //   // Clear button is rendered only when there's text
  //   // (select by aria-label to avoid data-cy mismatch)
  //   cy.get('button[aria-label="Clear search"]').should("exist").click()

  //   cy.get("@onChange").should("have.been.calledWith", "")

  //   // Input is visible and refocused
  //   cy.get('[data-cy="search-input"]').should("be.visible").and("be.focused")
  // })

  it("starts expanded when value is non-empty", () => {
    cy.mount(<EventsFilterBar value="preset" onChange={cy.stub()} />)

    // We expect the input to be present and visible (expanded)
    cy.get('[data-cy="search-input"]').should("exist").and("be.visible")
  })
})
