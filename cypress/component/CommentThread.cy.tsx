import Thread from 'components/content/Thread';
import { CommentThread } from 'pages/api/commentThread';
import { User } from 'pages/api/user/[email]';
import React from 'react';
import { Event } from 'pages/api/event/[eventId]'
import { Comment } from 'pages/api/comment/[commentId]';
import auth, { SessionProvider, useSession } from 'next-auth/react';

describe('Thread component with student-student', () => {
  const threadId = 1;
  const currentUserEmail = 'john@gmail.com';
  const currentUser: User = {
    id: '2',
    email: currentUserEmail,
    name: 'John',
    image: 'https://www.example.com/image.png',
    admin: false,
    emailVerified: new Date(),
  };
  const createdByEmail = 'bob@gmail.com'
  const createdByUser: User = {
    id: '1',
    email: createdByEmail,
    name: 'Bob',
    image: 'https://www.example.com/image.png',
    admin: false,
    emailVerified: new Date(),
  };
  const thread: CommentThread = {
    id: threadId,
    eventId: 1,
    groupId: null,
    section: '',
    problemTag: '',
    textRef: '',
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
        markdown: 'Old comment',
      }
    ],
  };

  const newComment: Comment = {
    id: 2,
    threadId: threadId,
    createdByEmail: currentUserEmail,
    created: new Date(),
    index: 1,
    markdown: '',
  };
  const event: Event = {
    content: 'test',
    end: new Date(),
    start: new Date(),
    id: 1,
    enrol: '',
    name: 'test',
    EventGroup: [],
    hidden: false,
    summary: '',
    UserOnEvent: [
      {
        eventId: 1,
        status: 'STUDENT',
        userEmail: currentUserEmail,
        user: currentUser,
      },
      {
        eventId: 1,
        status: 'STUDENT',
        userEmail: createdByEmail,
        user: createdByUser,
      }
    ],
  };

  beforeEach(() => {
    cy.intercept(`/api/commentThread/${threadId}`, { commentThread: thread }).as("thread");
    cy.intercept(`/api/user/${createdByEmail}`, { user: createdByUser }).as("createdByUser");
    cy.intercept(`/api/user/${currentUserEmail}`, { user: currentUser }).as("currentUser");
    cy.stub(sessionStorage, 'getItem').returns('1')
    cy.intercept(`/api/event/1`, { event }).as("event");
    const setActiveSpy = cy.spy().as("setActive");
    const onDeleteSpy = cy.spy().as("onDelete");
    const now = new Date();
    const tenMinutesFromNow = new Date();
    tenMinutesFromNow.setTime(now.getTime() + 10 * 60 * 1000);
    cy.mount(
        <Thread
          threadId={threadId}
          active={true}
          setActive={setActiveSpy}
          onDelete={onDeleteSpy}
        />
      , { session: { expires: tenMinutesFromNow, user: currentUser } }
    );
  });

  it('should open and close the thread', () => {
    cy.get('[data-cy="Thread:1:OpenCloseButton"]').click();
    cy.get('@setActive').should('be.calledWith', false);
  });

  it('should add a comment to the thread', () => {
    cy.get('[data-cy="Comment:1:Main"]').should('be.visible').contains(thread.Comment[0].markdown);
    cy.get('[data-cy="Comment:2:Main"]').should('not.exist');
    cy.intercept(`/api/comment`, { comment: newComment }).as("comment");
    cy.get('[data-cy="Thread:1:Reply"]').click();
    cy.wait('@comment');
    cy.get('[data-cy="Comment:2:Main"]').should('be.visible');
    cy.get('[data-cy="Comment:2:Editing"]').should('be.visible');
  });

  it('should mark the thread as resolved', () => {
    cy.get('[data-cy="Thread:1:IsResolved"]').should('not.exist');
    cy.intercept(`/api/commentThread/${threadId}`, { commentThread: { ...thread, resolved: true } }).as("thread");
    cy.get('[data-cy="Thread:1:Resolved"]').click();
    cy.wait('@thread'); // PUT /api/commentThread/1
    cy.wait('@thread'); // GET /api/commentThread/1
    cy.get('[data-cy="Thread:1:IsResolved"]').should('be.visible');
  });

  it('should edit and save a comment', () => {
    cy.get('[data-cy="Comment:1:Main"]').should('be.visible').contains(thread.Comment[0].markdown);
    cy.get('[data-cy="Comment:1:Editing"]').should('not.exist');
    cy.get('[data-cy="Comment:1:Edit"]').click();
    cy.get('[data-cy="Comment:1:Editing"]').should('be.visible');
    cy.get('[data-cy="Comment:1:Editing"]').find('textarea').type('Edited old comment');
    const commentId = thread.Comment[0].id;
    cy.intercept(`/api/comment/${commentId}`, { commentThread: { ...thread.Comment[0], markdown: 'Edited old comment'} }).as("comment");
    cy.get('[data-cy="Comment:1:Save"]').click();
    cy.wait('@comment');
    cy.get('[data-cy="Comment:1:Main"]').should('be.visible').contains('Edited old comment');
    cy.get('[data-cy="Comment:1:Editing"]').should('not.exist');
  });

});