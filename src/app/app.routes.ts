import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/login/login';
import { RegisterPage } from './features/auth/register/register';
import { AppShell } from './layout/app-shell/app-shell';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'register',
    component: RegisterPage,
  },
  {
    path: 'workspace',
    component: AppShell,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];