import Paragraph from "components/content/Paragraph"
import { Section } from "lib/material"
import { Event } from "pages/api/event/[eventId]"
import { User } from "pages/api/user/[email]"
import { CommentThread } from "pages/api/commentThread"

describe("Paragraph", () => {
  const threadId = 1
  const threads: CommentThread[] = [
    {
      id: 1,
      eventId: 1,
      groupId: null,
      section: "test-comment",
      problemTag: "",
      textRef: "paragraph test comment",
      textRefStart: -1,
      textRefEnd: 5,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "This is a test comment that should appear",
        },
      ],
    },
    {
      id: 2,
      eventId: 1,
      groupId: null,
      section: "test-comment",
      problemTag: "",
      textRef: "this textref does not exist anywhere in the dom",
      textRefStart: -1,
      textRefEnd: 5,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "paragraph test comment",
        },
      ],
    },
    {
      id: 3,
      eventId: 1,
      groupId: null,
      section: "this-section-does-not-exist",
      problemTag: "",
      textRef: "this textref does not exist anywhere in the dom",
      textRefStart: -1,
      textRefEnd: 5,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "This is a test comment that should never appear",
        },
      ],
    },
  ]
  const section: Section = {
    id: "1",
    file: "test.md",
    course: "test course",
    theme: "test theme",
    name: "test name",
    markdown: "example \n markdown \n",
    dependsOn: [],
    tags: ["tag"],
    index: 1,
    type: "",
    attribution: [
      {
        citation: "author",
        url: "test",
        image: "test",
        license: "test",
      },
    ],
    learningOutcomes: ["LO 1", "LO 2"],
    problems: ["problem1"],
  }
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
  beforeEach(() => {
    cy.intercept(`/api/user/test@test.com`, { user: currentUser }).as("currentUser")
    cy.intercept(`/api/commentThread`, { commentThreads: threads }).as("commentThreads")
    cy.intercept(`/api/commentThread?eventId=1`, { commentThreads: threads }).as("commentThreads")
    cy.intercept(`/api/commentThread/1`, { commentThread: threads[0] }).as("commentThread")
    cy.intercept(`/api/event/1`, { event }).as("event")
  })
  it("renders", () => {
    cy.mount(
      <div className="mt-4 pt-4">
        <div className="mt-4 pt-4">
          <Paragraph section={"test"} content={"Paragraph test"} />
        </div>
      </div>
    )
  })
  context("without active event", () => {
    it("comment should not exist despite match", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:1:OpenCloseButton"]').should("not.exist")
    })
    it("comment should not exist", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })
  })

  context("with active event", () => {
    beforeEach(() => {
      cy.stub(localStorage, "getItem").returns("1")
    })
    it("comment exists and matches", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:1:OpenCloseButton"]').should("exist")
    })
    it("comment opened", () => {
      cy.on("uncaught:exception", (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test TODO: we need to revisit this at some point
        return false
      })
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="Thread:1:Dropdown"]').should("not.exist")
      cy.get('[data-cy="Thread:1:OpenCloseButton"]')
        .click()
        .wait(100)
        .get('[data-cy="Thread:1:Dropdown"]')
        .should("exist")
    })
    it("comment does not match textref", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })
    it("comment does not match", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test without comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:1:OpenCloseButton"]').should("not.exist")
    })
    it("comment does not match section", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test-comment"} content={"paragraph test comment"} />
          </div>
        </div>
      )
      cy.get('[data-cy="paragraph"]').should("exist")
      cy.get('[data-cy="Thread:3:OpenCloseButton"]').should("not.exist")
    })

    it("new comment button", () => {
      cy.mount(
        <div className="mt-4 pt-4">
          <div className="mt-4 pt-4">
            <Paragraph section={"test"} content={"Paragraph test"} />
          </div>
        </div>
      )
      cy.get('[data-cy="new-comment-button"]').should("not.exist")
      cy.get('[data-cy="paragraph"]')
        .trigger("mousedown", { which: 1, x: 10, y: 10 })
        .wait(100)
        .then(($el) => {
          const el = $el[0]
          const document = el.ownerDocument
          const range = document.createRange()
          range.selectNodeContents(el)
          document.getSelection()?.removeAllRanges()
          document.getSelection()?.addRange(range)
        })
        .trigger("mouseup", { which: 1, x: 70, y: 10 })
      cy.document().trigger("selectionchange")
      cy.get('[data-cy="new-comment-button"]').should("be.visible")
      cy.get('[data-cy="new-comment-form"]').should("not.exist")
      cy.get('[data-cy="new-comment-button"]').click()
      cy.get('[data-cy="new-comment-form"]').should("be.visible")
    })
  })
})
