import Content from "components/content/Content"
import { CommentThread } from "pages/api/commentThread"

describe("<Content /> with list items", () => {
  const LIST_MARKDOWN = `This is a paragraph

- Object oriented programming is fundamental
- Functional programming uses pure functions
- Procedural programming follows sequential steps

Another paragraph after the list.`

  const LOOSE_LIST_MARKDOWN = `This is a paragraph

- Object oriented programming is fundamental

- Functional programming uses pure functions

- Procedural programming follows sequential steps

Another paragraph after the list.`

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

  // Thread anchored to text in a list item
  const threads: CommentThread[] = [
    {
      id: 1,
      eventId: 1,
      groupId: null,
      section: "test.theme.course.section",
      problemTag: "",
      textRef: "second list item",
      textRefStart: 0,
      textRefEnd: 16,
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
          markdown: "Comment on second list item",
        },
      ],
    },
  ]

  beforeEach(() => {
    // Ensure the app reads the correct active event from localStorage
    cy.window().then((win) => {
      win.localStorage.setItem("activeEvent", "1")
    })
    cy.intercept("/api/user/test@test.com", { user }).as("getUser")
    cy.intercept("/api/event/1", { event }).as("getEvent")
    // Fallback intercept in case the component requests without query params
    cy.intercept("/api/commentThread", { commentThreads: threads }).as("getThreadsNoQuery")
    cy.intercept("/api/commentThread?eventId=1", { commentThreads: threads }).as("getThreads")
  })

  it("highlighting a list item text and creating a new thread works", () => {
    // Mount the Content component with test props
    cy.mount(
      <Content
        markdown={LIST_MARKDOWN}
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

    cy.get('[data-cy="new-comment-button"]').should("not.exist")
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"] > .m-0') // this is the first li within the ul
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
    cy.get('[data-cy="new-comment-form"]').should("not.exist")
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"]').find('[data-cy="new-comment-button"]').click()
    cy.get('[data-cy="new-comment-form"]').should("be.visible")
  })

  it("created comment in list item has valid textref", () => {
    cy.mount(
      <Content
        markdown={LIST_MARKDOWN}
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

    // Intercept POST to capture the payload and return valid response
    cy.intercept("POST", "/api/commentThread", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          commentThread: {
            id: 100,
            eventId: 1,
            groupId: null,
            section: req.body.commentThread.section,
            problemTag: "",
            textRef: req.body.commentThread.textRef,
            textRefStart: req.body.commentThread.textRefStart,
            textRefEnd: req.body.commentThread.textRefEnd,
            createdByEmail: "test@test.com",
            created: new Date().toISOString(),
            resolved: false,
            instructorOnly: false,
            Comment: [],
          },
        },
      })
    }).as("createThread")

    // Select text in the first list item
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"] > .m-0')
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

    // Click the comment button in the first list item
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"]').find('[data-cy="new-comment-button"]').click()

    // Type a comment in the textarea
    cy.get('[data-cy="new-comment-form"] textarea').type("This is a test comment")

    // Click the save button
    cy.get('[data-cy="new-comment-form"] button[aria-label="Save"]').click()

    // Verify POST has valid textRef
    cy.wait("@createThread")
      .its("request.body.commentThread")
      .should((commentThread) => {
        expect(commentThread.textRef).to.be.a("string")
        expect(commentThread.textRef).to.not.be.empty
        expect(commentThread.textRefStart).to.be.at.least(0)
        expect(commentThread.textRefEnd).to.be.greaterThan(commentThread.textRefStart)
      })
  })

  it("created comment in loose list item has valid textref", () => {
    cy.mount(
      <Content
        markdown={LIST_MARKDOWN}
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

    // Intercept POST to capture the payload and return valid response
    cy.intercept("POST", "/api/commentThread", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          commentThread: {
            id: 100,
            eventId: 1,
            groupId: null,
            section: req.body.commentThread.section,
            problemTag: "",
            textRef: req.body.commentThread.textRef,
            textRefStart: req.body.commentThread.textRefStart,
            textRefEnd: req.body.commentThread.textRefEnd,
            createdByEmail: "test@test.com",
            created: new Date().toISOString(),
            resolved: false,
            instructorOnly: false,
            Comment: [],
          },
        },
      })
    }).as("createThread")

    // Select text in the first list item
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"] > .m-0')
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

    // Click the comment button in the first list item
    cy.get('ul > :nth-child(1) > [data-cy="paragraph"]').find('[data-cy="new-comment-button"]').click()

    // Type a comment in the textarea
    cy.get('[data-cy="new-comment-form"] textarea').type("This is a test comment")

    // Click the save button
    cy.get('[data-cy="new-comment-form"] button[aria-label="Save"]').click()

    // Verify POST has valid textRef
    cy.wait("@createThread")
      .its("request.body.commentThread")
      .should((commentThread) => {
        expect(commentThread.textRef).to.be.a("string")
        expect(commentThread.textRef).to.not.be.empty
        expect(commentThread.textRefStart).to.be.at.least(0)
        expect(commentThread.textRefEnd).to.be.greaterThan(commentThread.textRefStart)
      })
  })

  it("embeds a provided thread only on the matching list item", () => {
    // Replace threads with a single thread anchored to the FIRST list item
    const firstLiThread: CommentThread = {
      id: 2,
      eventId: 1,
      groupId: null,
      section: "test.theme.course.section",
      problemTag: "",
      textRef: "Object oriented programming is fundamental",
      textRefStart: 0,
      textRefEnd: 36,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: 2,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "this is on the first list item",
        },
      ],
    }

    cy.intercept("/api/commentThread?eventId=1", { commentThreads: [firstLiThread] }).as("getThreadsFirstOnly")
    // Stub individual thread fetch (Thread component may request this by ID)
    cy.intercept("/api/commentThread/2", { commentThread: firstLiThread }).as("getThreadById")

    cy.mount(
      <Content
        markdown={LIST_MARKDOWN}
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

    // Verify API response shape matches route's Data type and that the thread was intercepted
    cy.wait("@getThreadsFirstOnly").then(({ response }) => {
      expect(response?.body).to.have.property("commentThreads")
      expect(response?.body.commentThreads).to.have.length(1)
      expect(response?.body.commentThreads[0]).to.include({ id: 2, eventId: 1, section: "test.theme.course.section" })
    })

    // Assert only the FIRST list item shows an existing thread indicator
    // Target the specific thread id for robustness
    cy.contains("li", "Object oriented programming is fundamental").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("exist")
    })

    cy.contains("li", "Functional programming uses pure functions").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })

    cy.contains("li", "Procedural programming follows sequential steps").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })
  })

  it("embeds a provided thread only on the matching loose list item", () => {
    // Replace threads with a single thread anchored to the FIRST list item
    const firstLiThread: CommentThread = {
      id: 2,
      eventId: 1,
      groupId: null,
      section: "test.theme.course.section",
      problemTag: "",
      textRef: "Object oriented programming is fundamental",
      textRefStart: 0,
      textRefEnd: 36,
      createdByEmail: "test@test.com",
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: 2,
          createdByEmail: "test@test.com",
          created: new Date(),
          index: 0,
          markdown: "this is on the first list item",
        },
      ],
    }

    cy.intercept("/api/commentThread?eventId=1", { commentThreads: [firstLiThread] }).as("getThreadsFirstOnly")
    // Stub individual thread fetch (Thread component may request this by ID)
    cy.intercept("/api/commentThread/2", { commentThread: firstLiThread }).as("getThreadById")

    cy.mount(
      <Content
        markdown={LOOSE_LIST_MARKDOWN}
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

    // Verify API response shape matches route's Data type and that the thread was intercepted
    cy.wait("@getThreadsFirstOnly").then(({ response }) => {
      expect(response?.body).to.have.property("commentThreads")
      expect(response?.body.commentThreads).to.have.length(1)
      expect(response?.body.commentThreads[0]).to.include({ id: 2, eventId: 1, section: "test.theme.course.section" })
    })

    // Assert only the FIRST list item shows an existing thread indicator
    // Target the specific thread id for robustness
    cy.contains("li", "Object oriented programming is fundamental").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("exist")
    })

    cy.contains("li", "Functional programming uses pure functions").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })

    cy.contains("li", "Procedural programming follows sequential steps").within(() => {
      cy.get('[data-cy="Thread:2:OpenCloseButton"]').should("not.exist")
    })
  })
})
