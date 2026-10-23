import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

/** Global app configuration: services and features available everywhere. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Reports uncaught errors in the browser
    // Hash URLs (/#/workspace): the server only ever loads index.html, so reloading never gives a 404.
    provideRouter(routes, withHashLocation()),
  ],
};
