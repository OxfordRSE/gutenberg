import React, { useState } from "react"
import SaveChangesAction from "components/ui/SaveChangesAction"
import useTransientSaveFeedback from "lib/hooks/useTransientSaveFeedback"

const SaveChangesActionHarness = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { error, showSuccess, begin, succeed } = useTransientSaveFeedback({ successDurationMs: 5000 })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    begin()

    setTimeout(() => {
      setIsSubmitting(false)
      succeed()
    }, 150)
  }

  return (
    <form onSubmit={handleSubmit}>
      <SaveChangesAction
        isSubmitting={isSubmitting}
        error={error}
        showSuccess={showSuccess}
        submitDataCy="save-button"
        feedbackDataCy="save-feedback"
      />
    </form>
  )
}

describe("<SaveChangesAction />", () => {
  it("shows disabled saving feedback and then success", () => {
    cy.clock()
    cy.mount(<SaveChangesActionHarness />)

    cy.get('[data-cy="save-button"]').should("contain.text", "Save Changes").and("not.be.disabled")
    cy.get('[data-cy="save-button"]').click()
    cy.get('[data-cy="save-button"]').should("be.disabled").and("contain.text", "Saving...")

    cy.tick(200)

    cy.get('[data-cy="save-button"]').should("not.be.disabled").and("contain.text", "Save Changes")
    cy.get('[data-cy="save-feedback"]').should("contain.text", "Changes saved.")
  })
})
