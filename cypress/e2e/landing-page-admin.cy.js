describe('admin landing page', () => {

    const user = {
        name: "admin",
        email: "admin@localhost",
      };

    beforeEach(() => {
      cy.visit('/')
      cy.login(user)
      cy.visit('/')
    })

    it('Create event button exists', () => {
        cy.contains('Create new Event').should('be.visible')
        })

    it('Delete event button exists', () => {
        cy.get('[data-cy*="delete-event"]').should('be.visible')
    })

    it('admin create/delete event', () => {
        cy.intercept('GET', '/api/auth/session').as('getSession')

        cy.request('GET', '/api/event')
            .its('body')
            .its('events')
            .as('oldres')
        cy.contains('Create new Event').click()

        cy.wait(1000).request('GET', '/api/event')
            .its('body')
            .its('events')
            .as('newres')

        cy.get('@oldres').then((oldres) => {
            cy.get('@newres').then((newres) => {
            // Verify that the second event response has one more item than the first one
                expect(newres.length).to.eq(oldres.length + 1)
                cy.wait(1000).then(() => {
                    let deleteId = 0
                    newres.map(item => {
                        if (item.id > deleteId) {
                            deleteId = item.id
                        }
                    })
                    cy.get('[data-cy="delete-event-'+deleteId+'"]').click()
                    cy.get('[data-cy="confirm-event-delete"]').should('be.visible')
                    cy.wait(2100).get('[data-cy="confirm-event-delete"]').click()
                    cy.get('[data-cy="event-deleted-toast"]').should('be.visible')
                    cy.wait(500).request('GET', '/api/event/')
                        .its('body')
                        .its('events')
                        .as('afterdeleteres')
                    cy.get('@afterdeleteres').then((res) => {
                        // have deleted last added event
                        expect(res.length).to.eq(oldres.length)
                    })
                })
            });
        });
            

    })
})