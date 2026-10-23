import { MAX_NAME_LENGTH } from './limits';

// Form checks used by login, register and password reset.
// Each function returns an error text, or '' when the value is fine.
// Browser checks are for quick feedback only. Firebase checks again on the server.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Checks an email address.
 *
 * @param value - Email as typed
 * @returns Error text, or an empty string
 */
export function validateEmail(value: string): string {
  const email = value.trim();
  if (!email) return 'Bitte gib deine E-Mail-Adresse ein.';
  if (!EMAIL_PATTERN.test(email)) return 'Diese E-Mail-Adresse ist ungültig.';
  return '';
}

/**
 * Checks a first and last name.
 *
 * @param value - Name as typed
 * @returns Error text, or an empty string
 */
export function validateName(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Bitte gib deinen Namen ein.';
  if (parts.length < 2) return 'Bitte gib Vor- und Nachnamen ein.';
  if (value.trim().length > MAX_NAME_LENGTH) return `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen lang sein.`;
  return '';
}

/**
 * Checks the password rules.
 *
 * @param value - Password as typed
 * @returns Error text, or an empty string
 */
export function validatePassword(value: string): string {
  if (!value) return 'Bitte gib ein Passwort ein.';
  if (value.length < MIN_PASSWORD_LENGTH) return `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`;
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return 'Mindestens ein Buchstabe und eine Zahl.';
  return '';
}

/**
 * Checks the repeated password.
 *
 * @param password - First password
 * @param repeat - Repeated password
 * @returns Error text, or an empty string
 */
export function validatePasswordRepeat(password: string, repeat: string): string {
  if (!repeat) return 'Bitte bestätige dein Passwort.';
  if (repeat !== password) return 'Die Passwörter stimmen nicht überein.';
  return '';
}
