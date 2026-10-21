import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

// Global app configuration: services and features available everywhere.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Reports uncaught errors in the browser
    // Hash URLs (/#/workspace): the server only ever loads index.html, so reloading never gives a 404.
    provideRouter(routes, withHashLocation()),
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
 * - provideRouter(routes, withHashLocation()): Schaltet das Routing mit
 *   unserer Routen-Liste ein. Die Adressen haben ein # (/#/workspace).
 *   Alles nach dem # bleibt im Browser, der Server lädt immer nur
 *   index.html. So gibt es beim Neuladen keinen Fehler 404, auch wenn
 *   der Server die .htaccess nicht beachtet.
 */