import { Pipe, PipeTransform } from '@angular/core';

// Date label between messages: "Heute" or e.g. "Dienstag, 14 Januar" (Figma format).
@Pipe({ name: 'chatDate' })
export class ChatDatePipe implements PipeTransform {
  transform(timestamp: number): string {
    const date = new Date(timestamp);
    if (isSameDay(date, new Date())) return 'Heute';
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
    const month = date.toLocaleDateString('de-DE', { month: 'long' });
    return `${weekday}, ${date.getDate()} ${month}`;
  }
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Pipe für die Datums-Trennlinie im Chat.
 * - Heute -> "Heute", sonst "Dienstag, 14 Januar" wie in Figma
 *   (ohne Punkt nach der Zahl, das ist die Figma-Schreibweise).
 * - toLocaleDateString('de-DE', ...): liefert Wochentag und Monat auf
 *   Deutsch, unabhängig von der Spracheinstellung des Browsers.
 * - isSameDay(): vergleicht nur das Datum, nicht die Uhrzeit. Wird auch
 *   in der Nachrichtenliste genutzt, um Trennlinien zu setzen.
 */
