import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

// Route guard: runs BEFORE a protected route opens.
// Returns true (route may open) or a UrlTree (redirect to the login page).
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der Guard schützt den Arbeitsbereich.
 *
 * - CanActivateFn: Ein funktionaler Guard. Angular ruft ihn auf, bevor
 *   eine Route (Seite) geöffnet wird.
 * - inject(): Holt den SessionService und den Router (Dependency
 *   Injection, Angular liefert die fertigen Instanzen).
 * - Ist der Benutzer eingeloggt, wird true zurückgegeben und die Seite
 *   öffnet sich. Sonst gibt createUrlTree() eine Umleitung zurück,
 *   und Angular öffnet stattdessen /login.
 * - Der Ternary-Operator  bedingung ? a : b  ist eine kurze
 *   Schreibweise für if/else.
 *
 * Wichtig: Der Guard ist eine Komfortfunktion für die Oberfläche, keine
 * Sicherheit. Die Daten selbst schützen erst die Zugriffsregeln der
 * Datenbank.
 */
