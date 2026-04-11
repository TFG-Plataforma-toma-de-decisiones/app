 const apiUrl = Cypress.env('apiUrl');
 it('test_dafo', function() {
    
    cy.intercept('GET', '**/model').as('getModel')
    cy.intercept('POST', '**/recommend').as('getRecomendaciones')
    cy.intercept('POST', '**/swot').as('getSwot')
    cy.intercept('POST', '**/exportar-dafo').as('downloadSwot')
    cy.visit('/');
    cy.get('a[href="/recomendador"]').click();
    cy.wait('@getModel');
    cy.contains('Backend').should('be.visible');
    cy.contains('.feature-name', 'Backend').click();
    cy.contains('.feature-name', 'ORM-01').click();
    cy.contains('.feature-name', 'Rest').click();
    cy.contains('.feature-name', 'Frontend').click();
    cy.contains('.feature-name', 'SPA').click();
    cy.contains('.feature-name', 'GlobalState-01').click();
    cy.get('[data-cy="submit-recommendation"]').click();
    cy.wait('@getRecomendaciones');
    cy.get('[data-cy="Flask"]').click();
    cy.get('[data-cy="React"]').click();
    cy.get('button.swot-button').click();
    cy.wait('@getSwot');
    cy.get('button.download-pdf-button').click();
    cy.wait('@downloadSwot');
 });