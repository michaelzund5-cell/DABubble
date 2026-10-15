import { computed, Injectable, signal } from '@angular/core';

// DEMO ONLY: fake login until a real auth provider is connected.
// IMPORTANT: Anything stored in the browser (localStorage, signals) can be changed by the user.
// This service only controls what the UI shows. Real protection must happen on the server
// (auth provider + database access rules).
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'dabubble-demo-user-id';
  private readonly demoUser = { id: 'u1', email: 'test@test.ch', password: '123456' };

  // ID of the logged-in user, or null if nobody is logged in.
  readonly currentUserId = signal<string | null>(this.readStoredUserId());

  // Derived value: recalculated automatically whenever currentUserId changes.
  readonly isLoggedIn = computed(() => this.currentUserId() !== null);

  login(email: string, password: string): boolean {
    const valid = email.trim().toLowerCase() === this.demoUser.email && password === this.demoUser.password;
    if (!valid) return false;
    this.currentUserId.set(this.demoUser.id);
    this.writeStoredUserId(this.demoUser.id);
    return true;
  }

  // Demo: guest uses the demo user. With Firebase this becomes an anonymous login.
  loginAsGuest(): void {
    this.currentUserId.set(this.demoUser.id);
    this.writeStoredUserId(this.demoUser.id);
  }

  logout(): void {
    this.currentUserId.set(null);
    this.writeStoredUserId(null);
  }

  // localStorage can throw (e.g. private mode), so every access is wrapped in try/catch.
  private readStoredUserId(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private writeStoredUserId(id: string | null): void {
    try {
      if (id) localStorage.setItem(this.storageKey, id);
      else localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore: the login still works for this browser tab.
    }
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Der SessionService verwaltet den Anmeldestatus (Session).
 *
 * - @Injectable({ providedIn: 'root' }): Angular erstellt genau eine
 *   Instanz dieses Services für die ganze App (Singleton). Jede
 *   Component, die ihn per inject() holt, bekommt dieselbe Instanz.
 * - currentUserId ist ein Signal: ein Wert, bei dem Angular merkt,
 *   wenn er sich ändert, und die Anzeige automatisch aktualisiert.
 * - isLoggedIn ist computed: ein abgeleiteter Wert. Er wird automatisch
 *   neu berechnet, wenn sich currentUserId ändert.
 * - login(): Vergleicht mit dem Demo-Zugang und speichert die
 *   Benutzer-ID im localStorage, damit man nach dem Neuladen
 *   eingeloggt bleibt.
 * - logout(): Setzt die ID auf null und löscht den Speicher.
 * - try/catch: Der Zugriff auf localStorage kann in manchen Browsern
 *   fehlschlagen (z. B. privater Modus). Dann stürzt die App nicht ab.
 *
 * Sicherheit: Alles im Browser kann der Benutzer selbst verändern.
 * Dieser Service steuert nur, was die Oberfläche zeigt. Echter Schutz
 * entsteht erst durch den Auth-Anbieter und die Zugriffsregeln der
 * Datenbank. Vorher wurde nur 'ja' gespeichert, jetzt die echte
 * Benutzer-ID, damit die App weiß, WER eingeloggt ist.
 */
