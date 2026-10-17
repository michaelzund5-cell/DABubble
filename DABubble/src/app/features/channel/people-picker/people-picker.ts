import { Component, computed, inject, input, model, signal } from '@angular/core';
import { UserService } from '../../../core/data/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { User } from '../../../shared/models/user.model';

// Search field to choose one or more people (add members, create channel).
@Component({
  selector: 'app-people-picker',
  imports: [Avatar],
  templateUrl: './people-picker.html',
  styleUrl: './people-picker.scss',
})
export class PeoplePicker {
  private readonly userService = inject(UserService);

  readonly excludeIds = input<string[]>([]); // e.g. people already in the channel
  readonly selectedIds = model<string[]>([]);

  readonly query = signal('');

  readonly selected = computed(() =>
    this.selectedIds().map((id) => this.userService.getById(id)).filter((user): user is User => !!user));

  readonly suggestions = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return [];
    const hidden = [...this.excludeIds(), ...this.selectedIds()];
    return this.userService.users().filter((user) =>
      !hidden.includes(user.id) && (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)));
  });

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  add(user: User, field: HTMLInputElement): void {
    this.selectedIds.update((ids) => [...ids, user.id]);
    this.query.set('');
    field.value = '';
    field.focus();
  }

  remove(id: string): void {
    this.selectedIds.update((ids) => ids.filter((selectedId) => selectedId !== id));
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Personen-Auswahl mit Suchfeld (Checkliste: "einen oder mehrere
 * Benutzer aus einer Liste auswählen").
 * - excludeIds: Personen, die nicht angeboten werden (schon Mitglied).
 * - selectedIds ist ein model(): Die Eltern-Komponente liest und setzt
 *   die Auswahl mit [(selectedIds)] (Zwei-Wege-Bindung).
 * - suggestions: Treffer nach Name oder E-Mail, in Echtzeit.
 * - add(): Person auswählen, Feld leeren, Fokus bleibt im Feld.
 * - remove(): Person wieder entfernen (Kreuz an der Pille).
 */
