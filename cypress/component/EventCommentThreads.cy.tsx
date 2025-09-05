import EventCommentThreads from "components/event/EventCommentThreads"
import { Material } from "lib/material"
import { EventFull } from "lib/types"
import { CommentThread } from "pages/api/commentThread/[commentThreadId]"

describe("EventCommentThreads component", () => {
  beforeEach(() => {
    const event: EventFull = {
      id: 1,
      content: "test",
      end: new Date(),
      start: new Date(),
      enrol: "",
      enrolKey: "test",
      instructorKey: "instructortest",
      name: "test",
      EventGroup: [],
      hidden: false,
      summary: "",
    }

    const material: Material = {
      markdown: "",
      name: "test",
      type: "material",
      themes: [
        {
          id: "theme1",
          repo: "test",
          name: "Theme 1",
          markdown: "",
          type: "theme",
          courses: [
            {
              files: [],
              id: "course1",
              name: "Course 1",
              summary: "",
              type: "course",
              attribution: [],
              learningOutcomes: ["LO 1", "LO 2"],
              dependsOn: [],
              markdown: "",
              theme: "theme1",
              sections: [
                {
                  id: "section1",
                  name: "Section 1",
                  problems: [],
                  course: "course1",
                  theme: "theme1",
                  markdown: "",
                  dependsOn: [],
                  type: "section",
                  attribution: [],
                  file: "",
                  index: 0,
                  tags: [],
                  learningOutcomes: ["LO 1", "LO 2"],
                },
              ],
            },
          ],
        },
      ],
    }
    // These are threads that will be associated with unresolved sections (No section)
    const threads: CommentThread[] = [
      {
        id: 1,
        eventId: 1,
        groupId: null,
        section: "theme1.course1.section1",
        problemTag: "",
        textRef: "",
        textRefStart: 0,
        textRefEnd: 0,
        createdByEmail: "student@gmail.com",
        created: new Date(),
        resolved: false,
        instructorOnly: false,
        Comment: [
          {
            id: 1,
            threadId: 1,
            createdByEmail: "student@gmail.com",
            created: new Date(),
            index: 0,
            markdown: "this is not workin!",
          },
        ],
      },
      {
        id: 2,
        eventId: 1,
        groupId: null,
        section: "theme1.course1.section1",
        problemTag: "",
        textRef: "",
        textRefStart: 0,
        textRefEnd: 0,
        createdByEmail: "student@gmail.com",
        created: new Date(),
        resolved: true,
        instructorOnly: false,
        Comment: [
          {
            id: 1,
            threadId: 1,
            createdByEmail: "student@gmail.com",
            created: new Date(),
            index: 0,
            markdown: "thankyou",
          },
        ],
      },
      {
        id: 3,
        eventId: 1,
        groupId: null,
        section: "test.theme1.course1.section1",
        problemTag: "",
        textRef: "",
        textRefStart: 0,
        textRefEnd: 0,
        createdByEmail: "student@gmail.com",
        created: new Date(),
        resolved: false,
        instructorOnly: false,
        Comment: [
          {
            id: 1,
            threadId: 1,
            createdByEmail: "student@gmail.com",
            created: new Date(),
            index: 0,
            markdown: "This is an unresolved thread in a verified section",
          },
        ],
      },
      {
        id: 4,
        eventId: 1,
        groupId: null,
        section: "test.theme1.course1.section1",
        problemTag: "",
        textRef: "",
        textRefStart: 0,
        textRefEnd: 0,
        createdByEmail: "student@gmail.com",
        created: new Date(),
        resolved: true,
        instructorOnly: false,
        Comment: [
          {
            id: 1,
            threadId: 1,
            createdByEmail: "student@gmail.com",
            created: new Date(),
            index: 0,
            markdown: "This is a resolved thread in a verified section",
          },
        ],
      },
    ]

    cy.intercept("/api/commentThread?eventId=1", { commentThreads: threads }).as("commentThreads")
    cy.mount(<EventCommentThreads event={event} material={material} />)
    cy.wait("@commentThreads")
  })
  context("For threads associated with a missing section", () => {
    it("shows unresolved threads by default", () => {
      cy.get('[data-cy="section:No Section found (material changed?):unresolved"]').click()
      cy.contains("thankyou").should("not.be.visible")
      cy.contains("this is not workin!").should("be.visible")
    })

    it("can hide unresolved threads", () => {
      cy.get('[data-cy="section:No Section found (material changed?):unresolved"]').should("be.visible")
      cy.get('[data-cy="unresolved-threads-expand"]').click()
      cy.get('[data-cy="section:No Section found (material changed?):unresolved"]').should("not.be.visible")
    })

    it("shows resolved threads when clicked", () => {
      cy.get('[data-cy="resolved-threads-expand"]').click()
      cy.get('[data-cy="section:No Section found (material changed?):resolved"]').should("be.visible")
      cy.get('[data-cy="section:No Section found (material changed?):resolved"]').click()
      cy.contains("thankyou").should("be.visible")
    })
  })
  context("For threads in 'Section 1'", () => {
    it("shows unresolved threads by default, can hide", () => {
      cy.contains("This is an unresolved thread in a verified section").should("be.visible")
      cy.contains("This is a resolved thread in a verified section").should("not.be.visible")
      cy.get('[data-cy="unresolved-threads-expand"]').should("be.visible").click()
      cy.contains("This is an unresolved thread in a verified section").should("not.be.visible")
    })

    it("can hide sections", () => {
      cy.contains("This is an unresolved thread in a verified section").should("be.visible")
      cy.get('[data-cy="section:Section 1:unresolved"]').click()
      cy.wait(100)
      cy.contains("This is an unresolved thread in a verified section").should("not.exist")
    })

    it("shows resolved threads when clicked", () => {
      cy.get('[data-cy="section:Section 1:resolved"]').should("not.be.visible")
      cy.get('[data-cy="resolved-threads-expand"]').click()
      cy.get('[data-cy="section:No Section found (material changed?):resolved"]').should("be.visible")
      cy.contains("This is a resolved thread in a verified section").should("be.visible")
      cy.get('[data-cy="section:Section 1:resolved"]').should("be.visible").click()
      cy.contains("This is a resolved thread in a verified section").should("not.exist")
    })
  })
})
