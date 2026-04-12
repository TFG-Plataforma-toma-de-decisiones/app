// cypress.config.js

// 1. Cargamos las variables del archivo .env al inicio
require('dotenv').config();

const { defineConfig } = require('cypress');
const { execSync } = require('child_process');
const { createClient } = require('redis');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({

  e2e: {
    baseUrl: 'http://localhost:5173', 
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      on('task', {
        resetDjangoDB() {
          const djangoCmd = process.env.DJANGO_EXEC_CMD || 'python manage.py';
          
          try {
            execSync(`${djangoCmd} flush --no-input`, {stdio: 'inherit' });
            execSync(`${djangoCmd} loaddata configurador/test/test_data/test_fixture.json`, {stdio: 'inherit' });
            execSync(`${djangoCmd} createsuperuser --noinput`, {stdio: 'inherit' });
            
            return null; // Cypress exige retornar null para tareas síncronas exitosas
          } catch (error) {
            console.error("Error al resetear la BD de Django. Revisa los logs de la consola.");
            throw error;
          }
        },
        updateFlamapyCache() {
          const djangoCmd = process.env.DJANGO_EXEC_CMD || 'python manage.py';
          
          try {
            console.log(`[Cypress Setup] Llamando al comando nativo de Django para invalidar caché...`);
            
            // Mucho más limpio. Ejecuta directamente el comando que acabamos de crear.
            execSync(`${djangoCmd} update_flamapy_cache`, { stdio: 'inherit' });
            
            return null;
          } catch (error) {
            console.error("Error al invalidar la caché:", error.message);
            throw error;
          }
        },
        restoreUvlFile() {
          try {
            const backupPath = path.resolve(__dirname, '../backend/configurador/test/test_data/test_model_backup.uvl');
            const targetPath = path.resolve(__dirname, '../backend/configurador/test/test_data/test_model.uvl');
            
            console.log(`[Cypress Setup] Restaurando UVL en: ${targetPath}`);
            fs.copyFileSync(backupPath, targetPath);
            
            return null;
          } catch (error) {
            console.error("Error al restaurar el archivo UVL:", error.message);
            throw error;
          }
        }

      });
    },
  },
});