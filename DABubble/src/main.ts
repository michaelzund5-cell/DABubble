import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Entry point: starts the Angular app with the root component and the global configuration.
bootstrapApplication(App, appConfig).catch((error) => console.error(error));

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der Startpunkt der App.
 *
 * bootstrapApplication() startet Angular mit der Hauptkomponente (App)
 * und der Konfiguration (appConfig). Geht dabei etwas schief, fängt
 * catch() den Fehler ab und gibt ihn in der Konsole aus.
 */
