import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;

  login(email: string, password: string): boolean {
    const validEmail = 'test@test.ch';
    const validPassword = '123456';

    const isValid =
      email.trim().toLowerCase() === validEmail &&
      password.trim() === validPassword;

    this.loggedIn = isValid;

    return isValid;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logout(): void {
    this.loggedIn = false;
  }
}