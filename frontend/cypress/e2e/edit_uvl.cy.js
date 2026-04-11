it('edit_uvl', function() {

    cy.visit('/')
    cy.intercept('POST','**/login').as('login')
    cy.intercept('GET','**/me').as('myUser')
    cy.intercept('GET','**/manage-uvl').as('getUVL')
    cy.intercept('POST','**/manage-uvl').as('saveUVL')
    cy.intercept('GET','**/projects/draft').as('getDraftProjects')
    cy.intercept('PUT','**/projects/draft/*').as('saveDraftProject')
    cy.intercept('DELETE','**/projects/draft/*').as('deleteDraftProject')
    cy.get('[data-cy="nav-login"]').click();
    cy.get('[data-cy="login-username"]').click();
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('admin');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="nav-model"]').click();
    cy.wait('@getUVL')
    cy.get('[data-cy="add-relation-root-relation-0-child-0"]').click();
    cy.get('#root div:nth-child(5) > div.relation-header > select.node-type-select').select('ALTERNATIVE');
    cy.get('#root div:nth-child(5) > div.node-children > div.editable-node > div.node-header').click();
    cy.get('#root input[value="Caracteristica 1"]').type('{enter}');
    cy.get('[data-cy="add-feature-root-relation-0-child-0-relation-4"]').click();
    cy.get('#root div.editor-container > div:nth-child(1)').click();
    cy.get('#root input[value="Caracteristica 2"]').type('{enter}');
    cy.get('#root button.submit-button').click();
    cy.wait('@saveUVL')
    cy.get('[data-cy="project-card-Flask"] div.tags-container').click();
    cy.get('[data-cy="feature-Caracteristica-1"] span.feature-name').click();
    cy.get('#control-Caracteristica-1').check();
    cy.get('[data-cy="save-draft-project"]').click();
    cy.get('[data-cy="delete-project-Django"]').click();
    cy.wait('@saveDraftProject')
    cy.get('#root button.modal-btn-delete').click();
    cy.wait('@deleteDraftProject')
    cy.get('#root button.submit-button').click();
});