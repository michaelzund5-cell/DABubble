import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-reset-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordResetPage {
  email = '';
  message = '';

  // DEMO ONLY: the real reset email will be sent by the auth provider / backend.
  requestReset(): void {
    this.message = this.email.trim()
      ? 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.'
      : 'Bitte E-Mail eingeben.';
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die Seite "Passwort vergessen" (noch Demo).
 *
 * - requestReset(): Ist eine E-Mail eingegeben, kommt eine
 *   Bestätigung, sonst ein Hinweis. Der Ternary-Operator ? : wählt
 *   zwischen den beiden Texten.
 * - Die Bestätigung lautet bewusst "Falls ein Konto existiert ...".
 *   So verrät die Seite nicht, ob eine E-Mail registriert ist
 *   (gleiche Sicherheitsidee wie beim Login).
 * - Den echten Versand übernimmt später der Auth-Anbieter oder das
 *   Backend, nicht n8n (siehe n8n-Bauplan).
 */
