// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
import './commands'
Cypress.ElementSelector.defaults({
  selectorPriority: [
    'data-cy',
    'data-test',
    'data-testid',
    'id',      
    'class',
    'attributes',
    'tag',
    'nth-child'
  ],
})