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

/** Maps URLs to pages. The order matters: Angular uses the first matching route. */
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
