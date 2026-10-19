import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

// Route guard: runs BEFORE a protected route opens.
// Waits until Firebase has restored the session, then lets the user in or sends him to the login page.
export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  await session.ready;
  return session.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Türsteher für den Workspace.
 * - Läuft, bevor /workspace geöffnet wird.
 * - await session.ready: Nach dem Neuladen braucht Firebase einen
 *   Moment, um die Anmeldung wiederherzustellen. Ohne Warten würde man
 *   kurz auf den Login geworfen, obwohl man angemeldet ist.
 * - Angemeldet: true, die Seite öffnet sich. Sonst Weiterleitung auf
 *   /login.
 * - Wichtig: Der Guard schützt nur die Oberfläche. Die Daten schützen
 *   die Firestore-Regeln auf dem Server.
 */
