import React from "react"
import { CourseStatus } from "@prisma/client"
import CourseActiveActions from "components/courses/CourseActiveActions"
import { ContextProvider } from "lib/context/ContextProvider"

const mountAction = (status: CourseStatus | null, props?: Partial<React.ComponentProps<typeof CourseActiveActions>>) => {
  cy.mount(
    <ContextProvider>
      <CourseActiveActions courseId={props?.courseId ?? 7} status={status} verbose={props?.verbose} size={props?.size} />
    </ContextProvider>
  )
}

describe("<CourseActiveActions />", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it("allows enrolled courses to be selected and deselected as active", () => {
    mountAction(CourseStatus.ENROLLED)

    cy.contains("button", "Select").should("be.visible").click()
    cy.contains("button", "Unselect").should("be.visible")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeCourse")).to.eq("7")
    })

    cy.contains("button", "Unselect").click()
    cy.contains("button", "Select").should("be.visible")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("activeCourse")).to.be.null
    })
  })

  it("supports the verbose copy for course detail pages", () => {
    mountAction(CourseStatus.COMPLETED, { verbose: true, size: "sm" })

    cy.contains("button", "Select as your active course").should("be.visible").click()
    cy.contains("button", "Deselect as active course").should("be.visible")
  })

  it("does not render for courses that are not enrolled", () => {
    mountAction(null)
    cy.contains("button", "Select").should("not.exist")

    mountAction(CourseStatus.DROPPED, { courseId: 8 })
    cy.contains("button", "Select").should("not.exist")
  })
})
