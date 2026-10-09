import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(email: string, password: string): boolean {
    const validEmail = 'test@test.ch';
    const validPassword = '123456';

    return (
      email.trim().toLowerCase() === validEmail &&
      password.trim() === validPassword
    );
  }
}