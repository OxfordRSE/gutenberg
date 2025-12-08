import Content from "components/content/Content"
import { CommentThread } from "pages/api/commentThread"

describe("<Content /> with inline formatting", () => {
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

  const testCases = [
    {
      name: "boldInline",
      markdown: `One paragraph.\n\nTwo paragraph.\n\nThis is a **very important** concept to remember.`,
      threadTextRef: "This is a very important concept to remember.",
    },
    {
      name: "linkInline",
      markdown: `One paragraph.\n\nTwo paragraph.\n\nPlease click [here](https://example.com) now to continue learning.`,
      threadTextRef: "Please click here now to continue learning.",
    },
    {
      name: "heavyFormatting",
      markdown: `One paragraph.\n\nTwo paragraph.\n\nThis is ***very*** **extremely** *interesting* text indeed.`,
      threadTextRef: "This is very extremely interesting text indeed.",
    },
    {
      name: "inlineCode",
      markdown: `One paragraph.\n\nTwo paragraph.\n\nUse \`x = 1\` in code.`,
      threadTextRef: "Use x = 1 in code.",
    },
  ]

  // Helper: return the .m-0 text node of the Nth paragraph
  // Paragraph 0: "One paragraph."
  // Paragraph 1: "Two paragraph."
  // Paragraph 2: target content paragraph
  const paragraphAt = (index: number) => cy.get("[data-cy='paragraph']").eq(index).find(".m-0")

  testCases.forEach(({ name, markdown, threadTextRef }, index) => {
    const threadId = 100 + index

    describe(`EDGE CASE: ${name}`, () => {
      beforeEach(() => {
        cy.window().then((win) => {
          win.localStorage.setItem("activeEvent", "1")
        })

        cy.intercept("/api/user/test@test.com", { user }).as("getUser")
        cy.intercept("/api/event/1", { event }).as("getEvent")
      })

      it(`creates valid textRef for ${name}`, () => {
        // Must register POST intercept BEFORE mount
        cy.intercept("POST", "/api/commentThread").as("createThread")

        cy.mount(
          <Content
            markdown={markdown}
            theme={{ id: "theme", repo: "test", name: "Test Theme", markdown: "", type: "theme", courses: [] }}
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

        // Programmatic selection on paragraph #2 (index = 2)
        paragraphAt(2)
          .first()
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

        // Click the comment button inside paragraph #2
        cy.get('[data-cy="paragraph"]').eq(2).find("[data-cy='new-comment-button']").click()

        cy.get("[data-cy='new-comment-form'] textarea").type("This is a test comment")

        cy.get("[data-cy='new-comment-form'] button[aria-label='Save']").click()

        cy.wait("@createThread").then((xhr) => {
          const ctReq = xhr.request.body?.commentThread

          expect(ctReq.textRef).to.be.a("string")
          expect(ctReq.textRef).to.not.be.empty
          expect(ctReq.textRefStart).to.be.at.least(0)
          expect(ctReq.textRefEnd).to.be.greaterThan(ctReq.textRefStart)
        })
      })

      it(`embeds a provided thread only on the matching paragraph for ${name}`, () => {
        const threadData: CommentThread = {
          id: threadId,
          eventId: 1,
          groupId: null,
          section: "test.theme.course.section",
          problemTag: "",
          textRef: threadTextRef,
          textRefStart: 0,
          textRefEnd: threadTextRef.length,
          createdByEmail: "test@test.com",
          created: new Date(),
          resolved: false,
          instructorOnly: false,
          Comment: [
            {
              id: 1,
              threadId,
              createdByEmail: "test@test.com",
              created: new Date(),
              index: 0,
              markdown: `Comment on ${name}`,
            },
          ],
        }

        cy.intercept("/api/commentThread?eventId=1", {
          commentThreads: [threadData],
        }).as("getThreads")

        cy.intercept(`/api/commentThread/${threadId}`, {
          commentThread: threadData,
        }).as("getThreadById")

        cy.mount(
          <Content
            markdown={markdown}
            theme={{ id: "theme", repo: "test", name: "Test Theme", markdown: "", type: "theme", courses: [] }}
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

        // Assert thread indicator appears only in paragraph #2
        cy.get("[data-cy='paragraph']").eq(2).find(`[data-cy="Thread:${threadId}:OpenCloseButton"]`).should("exist")

        // Ensure it does NOT appear elsewhere
        cy.get("[data-cy='paragraph']").eq(0).find(`[data-cy="Thread:${threadId}:OpenCloseButton"]`).should("not.exist")

        cy.get("[data-cy='paragraph']").eq(1).find(`[data-cy="Thread:${threadId}:OpenCloseButton"]`).should("not.exist")
      })
    })
  })
})
