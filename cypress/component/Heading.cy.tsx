import React from "react"
import Heading from "components/content/Heading"
import { Event } from "pages/api/event/[eventId]"
import { User } from "pages/api/user/[email]"
import { CommentThread } from "pages/api/commentThread"

const stubClipboard = (alias: string) => {
  cy.window().then((win) => {
    const writeText = cy
      .stub()
      .callsFake(() => Promise.resolve())
      .as(alias)
    Object.defineProperty(win.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })
  })
}

describe("<Heading />", () => {
  it("renders the requested heading tag and applies the optional span id", () => {
    cy.mount(<Heading content="Secure Content" section="course.section" tag="h3" spanId="secure-content-span" />)

    cy.get("h3#Secure-Content").should("exist")
    cy.get("#secure-content-span").should("contain.text", "Secure Content")
  })

  it("copies the heading link to the clipboard", () => {
    cy.mount(<Heading content="Secure Content" section="course.section" tag="h2" />)

    stubClipboard("writeHeadingLink")

    cy.window().then((win) => {
      const expectedUrl = `${win.location.href.split("#")[0]}#Secure-Content`
      cy.wrap(expectedUrl).as("expectedHeadingUrl")
    })

    cy.get("h2#Secure-Content button").click()
    cy.get("@expectedHeadingUrl").then((expectedHeadingUrl) => {
      cy.get("@writeHeadingLink").should("have.been.calledOnceWith", expectedHeadingUrl)
    })
    cy.get('[data-cy="copy-feedback"]').should("be.visible").and("contain.text", "Copied to clipboard!")
  })

  it("generates the copied heading url from React child content", () => {
    cy.mount(
      <Heading
        content={
          <>
            <code>Secure</code>
            {" Content"}
          </>
        }
        section="course.section"
        tag="h2"
      />
    )

    stubClipboard("writeHeadingLinkFromNode")

    cy.window().then((win) => {
      const expectedUrl = `${win.location.href.split("#")[0]}#Secure-Content`
      cy.wrap(expectedUrl).as("expectedHeadingUrlFromNode")
    })

    cy.get("h2#Secure-Content").should("exist")
    cy.get("h2#Secure-Content button").click()
    cy.get("@expectedHeadingUrlFromNode").then((expectedHeadingUrl) => {
      cy.get("@writeHeadingLinkFromNode").should("have.been.calledOnceWith", expectedHeadingUrl)
    })
  })

  it("renders a matching comment thread for an active event", () => {
    const currentUser: User = {
      id: "2",
      email: "test@test.com",
      name: "Test User",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const event: Event = {
      content: "test",
      end: new Date(),
      start: new Date(),
      id: 1,
      enrol: "",
      enrolKey: "test",
      instructorKey: "instructortest",
      name: "test",
      EventGroup: [],
      hidden: false,
      summary: "",
      UserOnEvent: [
        {
          eventId: 1,
          status: "STUDENT",
          userEmail: "test@test.com",
          user: currentUser,
        },
      ],
    }
    const thread: CommentThread = {
      id: 1,
      eventId: 1,
      groupId: null,
      section: "course.section",
      problemTag: "",
      textRef: "Commentable heading",
      textRefStart: 0,
      textRefEnd: 11,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: 1,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "Heading comment",
        },
      ],
    }

    cy.stub(localStorage, "getItem").returns("1")
    cy.intercept("/api/event/1", { event })
    cy.intercept("/api/commentThread?eventId=1", { commentThreads: [thread] })
    cy.intercept("/api/commentThread/1", { commentThread: thread })

    cy.mount(<Heading content="Commentable heading" section="course.section" tag="h2" />)

    cy.get("h2#Commentable-heading").should("exist")
    cy.get('[data-cy="Thread:1:OpenCloseButton"]').should("exist")
  })
})
