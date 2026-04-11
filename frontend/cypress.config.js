const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Cambia esto al puerto donde se levanta tu React localmente
    baseUrl: 'http://localhost:5173', 
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});