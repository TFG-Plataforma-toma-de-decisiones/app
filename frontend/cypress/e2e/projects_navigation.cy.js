describe('Projects navigation', () => {
  beforeEach(() => {
    cy.task('setupE2eEnvironment');
  });
    it('Projects navigation and uvl render', function() {
        cy.intercept('GET','**/projects').as('getProjects')
        cy.intercept('GET','**/model').as('getUVL')
        cy.intercept('GET','**/projects/*').as('getProject')
        cy.intercept('GET','**/projects/draft').as('getDraftProjects')
        cy.visit('/')
        cy.wait('@getProjects')
        cy.get('[data-cy="project-card-Flask"]').click();
        cy.wait('@getProject')
        cy.wait('@getUVL')
        cy.get('[data-cy="feature-Backend"]').closest('.feature-card').should('have.class', 'active');
        cy.get('[data-cy="feature-Rest"]').closest('.feature-card').should('have.class', 'active');
        cy.get('[data-cy="feature-ORM-01"]').closest('.feature-card').should('not.have.class', 'active');
    });
});
