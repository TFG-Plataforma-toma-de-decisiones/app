describe('CRUD projects tests', () => {
  beforeEach(() => {
    cy.task('setupE2eEnvironment');
  });
  it('test_cr_project', function() {
    cy.visit('/')
    cy.intercept('POST','**/login').as('login')
    cy.intercept('GET','**/me').as('myUser')
    cy.intercept('POST','**/autocomplete').as('autocomplete')
    cy.get('[data-cy="nav-login"]').click();
    cy.get('[data-cy="login-username"]').type('admin'); 
    cy.get('[data-cy="login-password"]').type('admin');
    cy.get('[data-cy="login-submit"]').click();
    cy.wait('@login')
    cy.wait('@myUser')
    cy.get('[data-cy="create-project"]').click();
    cy.get('[data-cy="project-name-input"]').type('Nombre prueba');
    cy.get('[data-cy="autocomplete-project"]').click();
    cy.wait('@autocomplete')
    cy.get('[data-cy="project-description-input"]').should('not.have.value', '')
    cy.get('[data-cy="save-project"]').click();
    cy.get('[data-cy="delete-project-Nombre prueba"]').click();
    cy.get('#root button.modal-btn-delete').click();
    cy.get('[data-cy="delete-project-Nombre prueba"]').should('not.exist');
  });
});