import Paragraph from "components/content/Paragraph";
import { Section } from "lib/material";
import { Event } from 'pages/api/event/[eventId]'
import { User } from 'pages/api/user/[email]';
import { CommentThread } from "pages/api/commentThread";


describe("Paragraph", () => {  
      const section: Section = {
        id: '1',
        file: 'test.md',
        course:  'test course',
        theme: 'test theme',
        name: 'test name',
        markdown: 'example \n markdown \n',
        dependsOn: [],
        tags: ['tag'],
        index: 1,
        type: '',
        attribution: [{
            citation: 'author',
            url: 'test',
            image: 'test',
            license: 'test',
        }],
        problems: ['problem1'],
      }
      const currentUser: User = {
        id: '2',
        email: "test@test.com",
        name: 'Test User',
        image: 'https://www.example.com/image.png',
        admin: false,
        emailVerified: new Date(),
      };
      const event: Event = {
        content: 'test',
        end: new Date(),
        start: new Date(),
        id: 1,
        enrol: '',
        enrolKey: 'test',
        instructorKey: 'instructortest',
        name: 'test',
        EventGroup: [],
        hidden: false,
        summary: '',
        UserOnEvent: [
          {
            eventId: 1,
            status: 'STUDENT',
            userEmail: "test@test.com",
            user: currentUser,
          },
        ],
      };
  beforeEach(() => {
    cy.stub(sessionStorage, 'getItem').returns('1');
    cy.intercept(`/api/event/1`, { event }).as("event");
    cy.intercept(`/api/user/test@test.com`, { user: currentUser }).as("currentUser");
    // cy.intercept(`/api/commentThread?eventId=1`, { commentThread: thread }).as("thread");
  })

    it("renders", () => {
        cy.mount(<Paragraph section={"test"} content={"paragraph test"} />);
    });

    it.only("comment button", () => {
        cy.mount(<div className="mt-4 pt-4"><div className="mt-4 pt-4">
                  <Paragraph section={"test"} content={"Paragraph test"}/>
                 </div></div>)
        cy.get('[data-cy="new-comment-button"] > .flex').should('not.exist')
        cy.get('[data-cy="paragraph"]')
          .trigger('mousedown', { which: 1, x: 10, y: 10 })
          .wait(100)
          .then(($el) => {
            const el = $el[0]
            const document = el.ownerDocument
            const range = document.createRange()
            range.selectNodeContents(el)
            document.getSelection()?.removeAllRanges()
            document.getSelection()?.addRange(range)
          })
          .trigger('mouseup', { which: 1, x: 70, y: 10 })
        cy.document().trigger('selectionchange')
        cy.get('[data-cy="new-comment-button"]').should('be.visible')
        cy.get('[data-cy="new-comment-form"]').should('not.exist')
        cy.get('[data-cy="new-comment-button"]').click()
        cy.get('[data-cy="new-comment-form"]').should('be.visible')
      });
  })

