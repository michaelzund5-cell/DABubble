import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '../data/user.service';
import { SessionService } from './session.service';

export interface RegistrationDraft {
  name: string;
  email: string;
  password: string;
}

// Keeps the data of step 1 (form) until step 2 (avatar) is done.
// Memory only: the password is never written to localStorage.
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly userService = inject(UserService);
  private readonly session = inject(SessionService);
  private readonly draftState = signal<RegistrationDraft | null>(null);
  readonly draft = this.draftState.asReadonly();

  saveDraft(draft: RegistrationDraft): void {
    this.draftState.set(draft);
  }

  // Demo: creates the user locally. With Firebase this creates the real account.
  complete(avatar: string): boolean {
    const draft = this.draftState();
    if (!draft) return false;
    const id = this.userService.addUser(draft.name, draft.email, avatar);
    this.session.registerDemoAccount(id, draft.email, draft.password);
    this.draftState.set(null);
    return true;
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Zwischenspeicher für die Registrierung.
 * - Schritt 1 (Formular) speichert Name, E-Mail und Passwort hier.
 * - Schritt 2 (Avatar) schließt mit complete() ab.
 * - Nur im Arbeitsspeicher, nicht im localStorage: Ein Passwort darf nie im
 *   Browser-Speicher liegen, dort könnte es ausgelesen werden.
 * - Demo: legt den Benutzer lokal an. Mit Firebase wird hier das echte
 *   Konto erstellt.
 */
