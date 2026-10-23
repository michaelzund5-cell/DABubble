import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Entry point: starts the Angular app with the root component and the global configuration.
bootstrapApplication(App, appConfig).catch((error) => console.error(error));
