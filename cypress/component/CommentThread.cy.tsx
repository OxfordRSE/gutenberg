import Thread from "components/content/Thread"
import { CommentThread } from "pages/api/commentThread"
import { User } from "pages/api/user/[email]"
import React from "react"
import { Event } from "pages/api/event/[eventId]"
import { Comment } from "pages/api/comment/[commentId]"
import { getContainerEl } from "cypress/react"
import ReactDom from "react-dom"

describe("CommentThread component", () => {
  context("with non-owner student", () => {
    const threadId = 1
    const currentUserEmail = "john@gmail.com"
    const currentUser: User = {
      id: "2",
      email: currentUserEmail,
      name: "John",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const createdByEmail = "bob@gmail.com"
    const createdByUser: User = {
      id: "1",
      email: createdByEmail,
      name: "Bob",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const thread: CommentThread = {
      id: threadId,
      eventId: 1,
      groupId: null,
      section: "",
      problemTag: "",
      textRef: "",
      textRefStart: 0,
      textRefEnd: 0,
      createdByEmail: createdByEmail,
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: createdByEmail,
          created: new Date(),
          index: 0,
          markdown: "Old comment",
        },
      ],
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
          userEmail: currentUserEmail,
          user: currentUser,
        },
        {
          eventId: 1,
          status: "STUDENT",
          userEmail: createdByEmail,
          user: createdByUser,
        },
      ],
    }

    beforeEach(() => {
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: thread }).as("initialThread")
      cy.intercept(`/api/user/${createdByEmail}`, { user: createdByUser }).as("createdByUser")
      cy.intercept(`/api/user/${currentUserEmail}`, { user: currentUser }).as("currentUser")
      cy.stub(localStorage, "getItem").returns("1")
      cy.intercept(`/api/event/1`, { event }).as("event")

      const setActiveSpy = cy.spy().as("setActive")
      const onDeleteSpy = cy.spy().as("onDelete")
      const now = new Date()
      const tenMinutesFromNow = new Date()
      tenMinutesFromNow.setTime(now.getTime() + 10 * 60 * 1000)

      cy.mount(
        <Thread
          thread={threadId}
          active={true}
          setActive={setActiveSpy}
          onDelete={onDeleteSpy}
          finaliseThread={() => {}}
        />,
        { session: { expires: tenMinutesFromNow, user: currentUser } }
      )
    })

    it("should open and close the thread", () => {
      cy.get('[data-cy="Thread:1:CloseButton"]').click()
      cy.get("@setActive").should("be.calledWith", false)
    })

    it("should add a comment to the thread, edit and save, then delete", () => {
      cy.get('[data-cy="Comment:1:Main"]').should("be.visible").contains(thread.Comment[0].markdown)
      cy.get('[data-cy="Comment:2:Main"]').should("not.exist")
      const newComment: Comment = {
        id: 2,
        threadId: threadId,
        createdByEmail: currentUserEmail,
        created: new Date(),
        index: 1,
        markdown: "",
      }
      const newCommentThread: CommentThread = {
        ...thread,
        Comment: [...thread.Comment, newComment],
      }
      cy.intercept(`/api/comment`, { comment: newComment }).as("comment")
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: newCommentThread }).as("thread")
      cy.get('[data-cy="Thread:1:Reply"]').click()
      cy.wait("@comment")
      cy.wait("@thread")
      cy.get('[data-cy="Comment:2:Main"]').should("be.visible")
      cy.get('[data-cy="Comment:2:Editing"]').should("be.visible")
      cy.get('[data-cy="Comment:2:Viewing"]').should("not.exist")
      cy.get('[data-cy="Comment:2:Editing"]').find("textarea").type("New comment")
      const updatedComment: Comment = {
        ...newComment,
        markdown: "New comment",
      }
      const updatedThread: CommentThread = {
        ...newCommentThread,
        Comment: [...thread.Comment, updatedComment],
      }
      cy.intercept(`/api/comment/${newComment.id}`, { comment: updatedComment }).as("comment")
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: updatedThread }).as("thread")
      cy.get('[data-cy="Comment:2:Save"]').click()
      cy.wait("@comment")
      cy.wait("@thread")
      cy.get('[data-cy="Comment:2:Viewing"]').should("be.visible").contains("New comment")
      cy.get('[data-cy="Comment:2:Delete"]').should("be.visible")
      const deletedCommentThread: CommentThread = {
        ...updatedThread,
        Comment: [...updatedThread.Comment.filter((c) => c.id !== newComment.id)],
      }
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: deletedCommentThread }).as("thread")
      cy.get('[data-cy="Comment:2:Delete"]').click()
      cy.wait("@comment")
      cy.wait("@thread")
      cy.get('[data-cy="Comment:2:Main"]').should("not.exist")
    })

    it("should not be able to mark the thread as resolved", () => {
      cy.get('[data-cy="Thread:1:Resolved"]').should("not.exist")
    })

    it("should not be able to edit comment", () => {
      cy.get('[data-cy="Comment:1:Edit"]').should("not.exist")
    })

    it("should not be able to delete comment", () => {
      cy.get('[data-cy="Comment:1:Delete"]').should("not.exist")
    })
  })

  context("with owner student", () => {
    const threadId = 1
    const currentUserEmail = "john@gmail.com"
    const currentUser: User = {
      id: "2",
      email: currentUserEmail,
      name: "John",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const thread: CommentThread = {
      id: threadId,
      eventId: 1,
      groupId: null,
      section: "",
      problemTag: "",
      textRef: "",
      textRefStart: 0,
      textRefEnd: 0,
      createdByEmail: currentUserEmail,
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: currentUserEmail,
          created: new Date(),
          index: 0,
          markdown: "Old comment",
        },
      ],
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
          userEmail: currentUserEmail,
          user: currentUser,
        },
      ],
    }

    beforeEach(() => {
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: thread }).as("thread")
      cy.intercept(`/api/user/${currentUserEmail}`, { user: currentUser }).as("currentUser")
      cy.intercept("DELETE", `/api/comment/1`, { comment: thread.Comment[0] }).as("comment1")
      cy.stub(localStorage, "getItem").returns("1")
      cy.intercept(`/api/event/1`, { event }).as("event")
      const setActiveSpy = cy.spy().as("setActive")
      const onDeleteSpy = cy.spy().as("onDelete")
      const now = new Date()
      const tenMinutesFromNow = new Date()
      tenMinutesFromNow.setTime(now.getTime() + 10 * 60 * 1000)
      cy.mount(
        <Thread
          thread={threadId}
          active={true}
          setActive={setActiveSpy}
          onDelete={onDeleteSpy}
          finaliseThread={() => {}}
        />,
        { session: { expires: tenMinutesFromNow, user: currentUser } }
      )
    })

    it("should mark the thread as resolved", () => {
      cy.get('[data-cy="Thread:1:IsResolved"]').should("not.exist")
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: { ...thread, resolved: true } }).as("thread")
      cy.get('[data-cy="Thread:1:Resolved"]').click()
      cy.wait("@thread") // PUT /api/commentThread/1
      cy.wait("@thread") // GET /api/commentThread/1
      cy.get('[data-cy="Thread:1:IsResolved"]').should("be.visible")
    })

    it("should be able to delete Comment", () => {
      cy.get('[data-cy="Comment:1:Delete"]').should("be.visible")
      cy.get('[data-cy="Comment:1:Delete"]').click()
      cy.wait("@comment1") // DELETE /api/comment/1
    })

    it("should be able to edit Comment, textarea should become active and save button should appear", () => {
      cy.get('[data-cy="Comment:1:Edit"]').should("be.visible").click()
      cy.get('[data-cy="Comment:1:Editing"]').should("be.visible")
      cy.get("textarea") // Select the textarea
        .should("be.visible")
        .and("not.be.disabled")
        .and("not.have.attr", "readonly")
      cy.get('[data-cy="Comment:1:Save"]').should("be.visible")
    })

    it("should be able to delete Thread", () => {
      cy.get('[data-cy="Thread:1:Dropdown"]').should("be.visible").click()
      cy.get('[data-cy="Thread:1:Delete"]').should("be.visible")
      cy.get('[data-cy="Thread:1:Delete"]').click()
      cy.get("@onDelete").should("be.called")
    })
  })

  context("with non-owner instructor", () => {
    const threadId = 1
    const currentUserEmail = "john@gmail.com"
    const currentUser: User = {
      id: "2",
      email: currentUserEmail,
      name: "John",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const createdByEmail = "bob@gmail.com"
    const createdByUser: User = {
      id: "1",
      email: createdByEmail,
      name: "Bob",
      image: "https://www.example.com/image.png",
      admin: false,
      emailVerified: new Date(),
    }
    const thread: CommentThread = {
      id: threadId,
      eventId: 1,
      groupId: null,
      section: "",
      problemTag: "",
      textRef: "",
      textRefStart: 0,
      textRefEnd: 0,
      createdByEmail: createdByEmail,
      created: new Date(),
      resolved: false,
      instructorOnly: false,
      Comment: [
        {
          id: 1,
          threadId: threadId,
          createdByEmail: createdByEmail,
          created: new Date(),
          index: 0,
          markdown: "Old comment",
        },
      ],
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
          status: "INSTRUCTOR",
          userEmail: currentUserEmail,
          user: currentUser,
        },
        {
          eventId: 1,
          status: "STUDENT",
          userEmail: createdByEmail,
          user: createdByUser,
        },
      ],
    }

    beforeEach(() => {
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: thread }).as("thread")
      cy.intercept(`/api/user/${currentUserEmail}`, { user: currentUser }).as("currentUser")
      cy.stub(localStorage, "getItem").returns("1")
      cy.intercept(`/api/event/1`, { event }).as("event")
      const setActiveSpy = cy.spy().as("setActive")
      const onDeleteSpy = cy.spy().as("onDelete")
      const now = new Date()
      const tenMinutesFromNow = new Date()
      tenMinutesFromNow.setTime(now.getTime() + 10 * 60 * 1000)
      cy.mount(
        <Thread
          thread={threadId}
          active={true}
          setActive={setActiveSpy}
          onDelete={onDeleteSpy}
          finaliseThread={() => {}}
        />,
        { session: { expires: tenMinutesFromNow, user: currentUser } }
      )
    })

    it("should mark the thread as resolved", () => {
      cy.get('[data-cy="Thread:1:IsResolved"]').should("not.exist")
      cy.intercept(`/api/commentThread/${threadId}`, { commentThread: { ...thread, resolved: true } }).as("thread")
      cy.get('[data-cy="Thread:1:Resolved"]').click()
      cy.wait("@thread") // PUT /api/commentThread/1
      cy.wait("@thread") // GET /api/commentThread/1
      cy.get('[data-cy="Thread:1:IsResolved"]').should("be.visible")
    })

    it("should be able to delete Thread", () => {
      cy.get('[data-cy="Thread:1:Dropdown"]').should("be.visible").click()
      cy.get('[data-cy="Thread:1:Delete"]').should("be.visible")
      cy.get('[data-cy="Thread:1:Delete"]').click()
      cy.get("@onDelete").should("be.called")
    })
  })
})
