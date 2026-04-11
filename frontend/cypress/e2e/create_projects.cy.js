it('test_create_project', function() {
    cy.visit('/')
    cy.intercept('POST','**/login').as('login')
    cy.intercept('GET','**/me').as('myUser')
    cy.intercept('POST','**/autocomplete').as('autocomplete')
    cy.get('#root a.action-button').click();
    cy.get('#root input[placeholder="Usuario"]').click();
    cy.get('#root input[placeholder="Usuario"]').type('admin');
    cy.get('#root input[placeholder="Contraseña"]').type('admin');
    cy.get('#root button.form-button').click();
    cy.wait('@login')
    cy.wait('@myUser')
    cy.get('#root button.create-project-btn').click();
    cy.get('#root input[placeholder="Escribe el name..."]').click();
    cy.get('#root input[placeholder="Escribe el name..."]').type('Nombre prueba');
    cy.get('#root button.autocompletar-btn').click();
    cy.wait('@autocomplete')
    cy.get('input[name="description"]').should('not.have.value', '')
    cy.get('#root button.submit-button').click();
    cy.get('#root div:nth-child(8) div.project-card-content').click();
    cy.get('input[name="name"]').should('have.value', 'Nombre prueba')
});