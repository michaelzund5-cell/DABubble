import { Component, computed, inject, input, model, signal } from '@angular/core';
import { UserService } from '../../../core/data/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { User } from '../../../shared/models/user.model';

/** Search field to choose one or more people (add members, create channel). */
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

  /**
   * Updates the search text.
   * * @param event - Input event of the field
   *
   * @param event - Input event of the field
   */
  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /**
   * Adds a person to the selection.
   *
   * @param user - The chosen person
   * @param field - Search field, it is cleared and keeps the focus
   */
  add(user: User, field: HTMLInputElement): void {
    this.selectedIds.update((ids) => [...ids, user.id]);
    this.query.set('');
    field.value = '';
    field.focus();
  }

  /**
   * Removes a person from the selection.
   * * @param id - User ID
   *
   * @param id - User ID
   */
  remove(id: string): void {
    this.selectedIds.update((ids) => ids.filter((selectedId) => selectedId !== id));
  }
}
