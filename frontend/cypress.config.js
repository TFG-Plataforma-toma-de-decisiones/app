// cypress.config.js

// 1. Cargamos las variables del archivo .env al inicio
require('dotenv').config();

const { defineConfig } = require('cypress');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({

  e2e: {
    baseUrl: 'http://localhost:5173', 
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      on('task', {
        setupE2eEnvironment() {
          const djangoCmd = process.env.DJANGO_EXEC_CMD || 'python manage.py';
          
          try {
            console.log(`[Cypress] Preparando entorno E2E (DB, Cache y Archivos)...`);
            // Pagamos el tiempo de carga de Docker UNA sola vez
            execSync(`${djangoCmd} setup_e2e`, { stdio: 'inherit' });
            return null; 
          } catch (error) {
            console.error("Error crítico preparando el entorno E2E.");
            throw error;
          }
        }

      });
    },
  },
});