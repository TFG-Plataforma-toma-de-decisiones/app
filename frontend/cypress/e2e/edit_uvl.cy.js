describe('Edit uvl tests', () => {
  beforeEach(() => {
    cy.task('setupE2eEnvironment');
  });
    it('edit_uvl', function() {
        
        cy.visit('/')
        cy.intercept('POST','**/login').as('login')
        cy.intercept('GET','**/me').as('myUser')
        cy.intercept('GET','**/manage-uvl').as('getUVL')
        cy.intercept('PUT','**/manage-uvl').as('saveUVL')
        cy.intercept('GET','**/projects/draft').as('getDraftProjects')
        cy.intercept('PUT','**/projects/*/draft').as('saveDraftProject')
        cy.intercept('DELETE','**/projects/*/draft').as('deleteDraftProject')
        cy.get('[data-cy="nav-login"]').click();
        cy.get('[data-cy="login-username"]').click();
        cy.get('[data-cy="login-username"]').type('admin');
        cy.get('[data-cy="login-password"]').type('admin');
        cy.get('[data-cy="login-submit"]').click();
        cy.get('[data-cy="nav-model"]').click();
        cy.wait('@getUVL')
        cy.get('[data-cy="add-relation-root-relation-0-child-0"]').click();
        cy.get('[data-cy="relation-type-root-relation-0-child-0-relation-4"]').select('ALTERNATIVE');
        cy.get('[data-cy="feature-name-root-relation-0-child-0-relation-4-child-0"]').clear().type('Caracteristica 1');
        cy.get('[data-cy="add-feature-root-relation-0-child-0-relation-4"]').click();
        cy.get('[data-cy="feature-name-root-relation-0-child-0-relation-4-child-1"]').clear().type('Caracteristica 2');
        cy.get('[data-cy="feature-name-root-relation-0-child-0-relation-4-child-1"]').clear();
        cy.get('[data-cy="feature-name-root-relation-0-child-0-relation-4-child-1"]').type('Caracteristica ');
        cy.get('[data-cy="feature-node-header-root-relation-0-child-0-relation-4-child-0"] [data-cy="attribute-selector"]').select('__new__');
        cy.get('[data-cy="feature-node-header-root-relation-0-child-0-relation-4-child-0"] input.key-input').type('label{enter}');
        cy.get('[data-cy="attribute-input-Caracteristica 1"]').click();
        cy.get('[data-cy="attribute-input-Caracteristica 1"]').type('etiqueta{enter}');
        cy.get('[data-cy="save-uvl-model"]').click();
        cy.wait('@saveUVL')
        cy.wait('@getDraftProjects')
        cy.get('[data-cy="project-card-Flask"]').click();
        cy.get('[data-cy="feature-Caracteristica-1"]').click();
        cy.get('[data-cy="save-draft-project"]').click();
        cy.wait('@saveDraftProject')
        cy.get('[data-cy="delete-project-Django"]').click();
        cy.get('[data-cy="delete-modal-confirm"]').click();
        cy.wait('@deleteDraftProject')
        cy.get('[data-cy="confirm-draft"]').click();
        cy.wait('@saveUVL')
    });
});
