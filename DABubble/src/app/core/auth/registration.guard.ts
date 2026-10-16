import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RegistrationService } from './registration.service';

// The avatar step only opens after step 1 was filled in.
export const registrationGuard: CanActivateFn = () => {
  const registration = inject(RegistrationService);
  const router = inject(Router);
  return registration.draft() ? true : router.createUrlTree(['/register']);
};

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Guard für die Avatar-Seite.
 * - Läuft, BEVOR /register/avatar öffnet.
 * - Ohne ausgefüllten Schritt 1 geht es zurück zu /register.
 * - createUrlTree: Weiterleitung, die Angular sauber verarbeitet.
 */
