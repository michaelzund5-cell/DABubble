import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { registrationGuard } from './core/auth/registration.guard';
import { LoginPage } from './features/auth/login/login';
import { NewPasswordPage } from './features/auth/new-password/new-password';
import { PasswordResetPage } from './features/auth/password-reset/password-reset';
import { RegisterPage } from './features/auth/register/register';
import { SelectAvatarPage } from './features/auth/select-avatar/select-avatar';
import { ImprintPage } from './features/legal/imprint/imprint';
import { PrivacyPage } from './features/legal/privacy/privacy';
import { Workspace } from './layout/workspace/workspace';

// Maps URLs to pages. The order matters: Angular uses the first matching route.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'register/avatar', component: SelectAvatarPage, canActivate: [registrationGuard] },
  { path: 'password-reset', component: PasswordResetPage },
  { path: 'password-reset/new', component: NewPasswordPage },
  { path: 'imprint', component: ImprintPage },
  { path: 'privacy', component: PrivacyPage },
  // Protected: the guard checks the session before the workspace opens.
  { path: 'workspace', component: Workspace, canActivate: [authGuard] },
  // Wildcard: every unknown URL goes back to the login page.
  { path: '**', redirectTo: 'login' },
];

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die Routen legen fest, welche URL welche Seite anzeigt.
 *
 * - '' (leere URL): leitet auf /login weiter. pathMatch: 'full' heißt,
 *   nur wenn die URL wirklich komplett leer ist.
 * - /login, /register, /password-reset: die Seiten vor dem Login.
 * - /register/avatar: Schritt 2 der Registrierung. Der registrationGuard
 *   öffnet sie nur, wenn Schritt 1 ausgefüllt ist.
 * - /imprint, /privacy: Impressum und Datenschutz, ohne Login erreichbar.
 * - /password-reset/new: neues Passwort setzen. Hierhin führt der Link
 *   aus der E-Mail (später von Firebase).
 * - /workspace: der Arbeitsbereich. canActivate: [authGuard] heißt,
 *   der Guard prüft vorher, ob man eingeloggt ist.
 * - '**' ist eine Wildcard: Jede unbekannte URL führt zu /login.
 *   Sie muss am Ende stehen, weil Angular die erste passende Route
 *   nimmt.
 * Die URLs sind jetzt englisch, wie der restliche Code.
 */
