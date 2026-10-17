import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { AVATARS, DEFAULT_AVATAR } from '../../../shared/models/avatars';

// Profile card (Figma page 10). Own profile can be edited (user story 4), others get a "Nachricht" button.
@Component({
  selector: 'app-profile-dialog',
  imports: [Dialog, FormsModule],
  templateUrl: './profile-dialog.html',
  styleUrl: './profile-dialog.scss',
})
export class ProfileDialog {
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  readonly avatars = AVATARS;
  readonly defaultAvatar = DEFAULT_AVATAR;
  readonly user = computed(() => this.userService.getById(this.state.profileUserId()));
  readonly isOwn = computed(() => this.state.dialog() === 'ownProfile');

  readonly editing = signal(false);
  readonly selectedAvatar = signal(DEFAULT_AVATAR);
  readonly error = signal('');
  editName = '';

  startEditing(): void {
    const user = this.user();
    if (!user) return;
    this.editName = user.name;
    this.selectedAvatar.set(user.avatar ?? DEFAULT_AVATAR);
    this.error.set('');
    this.editing.set(true);
  }

  save(): void {
    const error = this.userService.updateProfile(this.editName, this.selectedAvatar());
    this.error.set(error);
    if (!error) this.editing.set(false);
  }

  // Opens the direct chat with this person and closes the card.
  writeMessage(userId: string): void {
    this.state.openView('direct', userId);
    this.state.closeDialog();
  }
}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Profil-Karte (Figma Seite 10).
 * - user: die Person, deren Profil offen ist (state.profileUserId).
 * - isOwn: eigenes Profil. Nur dann gibt es "Bearbeiten".
 * - Bearbeiten (User Story 4): Name ändern und einen Avatar aus der
 *   vorgegebenen Liste wählen. save() prüft den Namen im UserService
 *   (Vor- und Nachname) und zeigt sonst den Fehler unter dem Feld.
 * - Fremdes Profil: Button "Nachricht" öffnet die Direktnachricht.
 * - Der Bearbeiten-Modus ist in Figma (Desktop) nicht gezeichnet. Er nutzt
 *   dieselben Felder und Buttons wie die übrigen Seiten (Annahme).
 */
