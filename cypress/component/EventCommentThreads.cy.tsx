import EventCommentThreads from "components/EventCommentThreads"
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
              id: "course1",
              name: "Course 1",
              summary: "",
              type: "course",
              attribution: [],
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
    ]

    cy.intercept("/api/commentThread?eventId=1", { commentThreads: threads }).as("commentThreads")
    cy.mount(<EventCommentThreads event={event} material={material} />)
    cy.wait("@commentThreads")
  })

  it("shows unresolved threads", () => {
    cy.contains("thankyou").should("not.exist")
    cy.contains("this is not workin!").should("exist")
  })
})
