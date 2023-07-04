const { it } = require("node:test")

describe('landing page', () => {
  beforeEach(() => {
    cy.visit('/event/1')
  })

  it('has title', () => {
    cy.should('contain', 'Introduction to C++')
  });
});
