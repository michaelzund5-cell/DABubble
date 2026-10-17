// Maximum lengths for user input. Used in the templates (maxlength) and checked again in the services.
// Later the Firestore rules enforce the same limits on the server.
export const MAX_NAME_LENGTH = 60;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_DESCRIPTION_LENGTH = 500;

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Obergrenzen für Eingaben (Sicherheit und Stabilität).
 * - Ohne Grenze könnte jemand riesige Texte schicken und die App oder
 *   später die Datenbank belasten.
 * - Die Grenze steht an drei Stellen: im Eingabefeld (maxlength), im
 *   Service (zweite Prüfung, falls jemand das Feld umgeht) und später
 *   in den Firestore-Regeln (die einzige Prüfung, die nicht umgangen
 *   werden kann).
 * - Channel-Name: 40 Zeichen, steht direkt im Channel-Service.
 */
