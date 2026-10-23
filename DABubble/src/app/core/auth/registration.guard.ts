import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RegistrationService } from './registration.service';
import { SessionService } from './session.service';

/** The avatar step only opens right after the account was created in step 1. */
export const registrationGuard: CanActivateFn = () => {
  const registration = inject(RegistrationService);
  const session = inject(SessionService);
  const router = inject(Router);
  return registration.draft() && session.isLoggedIn() ? true : router.createUrlTree(['/register']);
};
