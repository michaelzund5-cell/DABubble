import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

/**
 * Route guard: runs BEFORE a protected route opens.
 * Waits until Firebase has restored the session, then lets the user in or sends him to the login page.
 */
export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  await session.ready;
  return session.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
