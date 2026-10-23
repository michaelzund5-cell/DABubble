import { Pipe, PipeTransform } from '@angular/core';

/** Date label between messages: "Heute" or e.g. "Dienstag, 14 Januar" (Figma format). */
@Pipe({ name: 'chatDate' })
export class ChatDatePipe implements PipeTransform {
  /**
   * Date label of the day divider.
   *
   * @param timestamp - Time in milliseconds
   * @returns "Heute" or e.g. "Dienstag, 14 Januar"
   */
  transform(timestamp: number): string {
    const date = new Date(timestamp);
    if (isSameDay(date, new Date())) return 'Heute';
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
    const month = date.toLocaleDateString('de-DE', { month: 'long' });
    return `${weekday}, ${date.getDate()} ${month}`;
  }
}

/**
 * Compares two calendar days.
 *
 * @param a - First date
 * @param b - Second date
 * @returns true when both are on the same calendar day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
