import Content from "components/content/Content"
import { CommentThread } from "pages/api/commentThread"

describe("<Content /> similarity matching", () => {
  const event = {
    id: 1,
    name: "Test Event",
    start: new Date(),
    end: new Date(),
    enrol: "",
    enrolKey: "test",
    instructorKey: "instructor",
    content: "",
    EventGroup: [],
    hidden: false,
    summary: "",
    UserOnEvent: [
      {
        eventId: 1,
        status: "STUDENT",
        userEmail: "test@test.com",
        user: {
          id: "1",
          email: "test@test.com",
          name: "Test User",
          image: "",
          admin: false,
          emailVerified: new Date(),
        },
      },
    ],
  }

  const user = {
    email: "test@test.com",
    name: "Test User",
    image: "",
    emailVerified: null,
    id: "",
  }

  it("matches a thread with typos to the correct paragraph", () => {
    // Actual paragraph that will appear in render
    const CORRECT_PARAGRAPH = "This is the paragraph with the correct spelling of the keyword."

    // Thread typo version (this should still match to the paragraph above)
    const TYPO_TEXTREF = "This is the paragraf with the correkt spelling of the keyword."

    // Build thread object the way backend would send it
    const typoThread: CommentThread = {
      id: 999,
      eventId: 1,
      groupId: null,
      section: "test.theme.course.section",
      problemTag: "",
      textRef: TYPO_TEXTREF,
      textRefStart: 0,
      textRefEnd: TYPO_TEXTREF.length,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 10,
          threadId: 999,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "Typo comment",
        },
      ],
    }

    // Intercepts before mount
    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "1")
    })

    cy.intercept("/api/user/test@test.com", { user }).as("getUser")
    cy.intercept("/api/event/1", { event }).as("getEvent")

    // IMPORTANT: similarThreads match happens inside Content, so we intercept GET threads
    cy.intercept("/api/commentThread?eventId=1", {
      commentThreads: [typoThread],
    }).as("getThreads")

    cy.intercept("/api/commentThread/999", {
      commentThread: typoThread,
    }).as("getThreadById")

    // Markdown with TWO paragraphs:
    // 0: unrelated
    // 1: correct target paragraph
    const MARKDOWN = `
First irrelevant paragraph.

${CORRECT_PARAGRAPH}

Final paragraph with no relation.
`

    cy.mount(
      <Content
        markdown={MARKDOWN}
        theme={{
          id: "theme",
          repo: "test",
          name: "Test Theme",
          markdown: "",
          type: "theme",
          courses: [],
        }}
        course={{
          id: "course",
          name: "Test Course",
          summary: "",
          type: "course",
          attribution: [],
          learningOutcomes: [],
          dependsOn: [],
          markdown: "",
          theme: "theme",
          sections: [],
          files: [],
        }}
        section={{
          id: "section",
          name: "Test Section",
          problems: [],
          course: "course",
          theme: "theme",
          markdown: "",
          dependsOn: [],
          type: "section",
          attribution: [],
          file: "",
          index: 0,
          tags: [],
          learningOutcomes: [],
        }}
      />
    )

    cy.wait("@getThreads")

    // The correct paragraph is index 1 (second paragraph)
    cy.get("[data-cy='paragraph']")
      .eq(1)
      .within(() => {
        cy.get(`[data-cy="Thread:999:OpenCloseButton"]`).should("exist")
      })

    // Ensure it does NOT match other paragraphs
    cy.get("[data-cy='paragraph']")
      .eq(0)
      .within(() => {
        cy.get(`[data-cy="Thread:999:OpenCloseButton"]`).should("not.exist")
      })

    cy.get("[data-cy='paragraph']")
      .eq(2)
      .within(() => {
        cy.get(`[data-cy="Thread:999:OpenCloseButton"]`).should("not.exist")
      })
  })
})
