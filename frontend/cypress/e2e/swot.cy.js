 const apiUrl = Cypress.env('apiUrl');
 it('test_dafo', function() {
    
    cy.intercept('GET', '**/model').as('getModel')
    cy.intercept('POST', '**/recommend').as('getRecomendaciones')
    cy.intercept('POST', '**/swot').as('getSwot')
    cy.intercept('POST', '**/exportar-dafo').as('downloadSwot')
    cy.visit('/');
    cy.get('[data-cy="nav-recommender"]').click();
    cy.wait('@getModel');
    cy.get('[data-cy="project-type-Backend"]').should('be.visible').click();
    cy.get('[data-cy="feature-ORM-01"]').click();
    cy.get('[data-cy="feature-Rest"]').click();
    cy.get('[data-cy="project-type-Frontend"]').click();
    cy.get('[data-cy="feature-SPA"]').click();
    cy.get('[data-cy="feature-GlobalState-01"]').click();
    cy.get('[data-cy="submit-recommendation"]').click();
    cy.wait('@getRecomendaciones');
    cy.get('[data-cy="recommendation-Flask"]').click();
    cy.get('[data-cy="recommendation-React"]').click();
    cy.get('[data-cy="generate-swot"]').click();
    cy.wait('@getSwot');
    cy.get('[data-cy="download-swot-pdf"]').click();
    cy.wait('@downloadSwot');
 });
