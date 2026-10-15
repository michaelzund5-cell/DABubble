import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Global app configuration: services and features available everywhere.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Reports uncaught errors in the browser
    provideRouter(routes),                // Activates routing with our route list
  ],
};

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die zentrale Konfiguration der App.
 *
 * providers ist eine Liste von Diensten, die Angular für die ganze App
 * bereitstellt:
 * - provideBrowserGlobalErrorListeners(): Fängt Fehler ab, die sonst
 *   unbemerkt bleiben würden.
 * - provideRouter(routes): Schaltet das Routing mit unserer
 *   Routen-Liste ein.
 * Später kommt hier z. B. die Verbindung zur Datenbank dazu.
 */
