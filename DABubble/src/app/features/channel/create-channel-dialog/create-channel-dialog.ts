import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../core/data/channel.service';
import { UserService } from '../../../core/data/user.service';
import { WorkspaceStateService } from '../../../core/data/workspace-state.service';
import { Dialog } from '../../../shared/components/dialog/dialog';
import { PeoplePicker } from '../people-picker/people-picker';

type AddMode = 'all' | 'some';

/** "Channel erstellen" (Figma mobile page 59), then step 2: choose the members. */
@Component({
  selector: 'app-create-channel-dialog',
  imports: [Dialog, FormsModule, PeoplePicker],
  templateUrl: './create-channel-dialog.html',
  styleUrl: './create-channel-dialog.scss',
})
export class CreateChannelDialog {
  private readonly channelService = inject(ChannelService);
  private readonly userService = inject(UserService);
  readonly state = inject(WorkspaceStateService);

  readonly step = signal<1 | 2>(1);
  readonly nameError = signal('');
  readonly addMode = signal<AddMode>('all');
  readonly selectedIds = signal<string[]>([]);
  readonly busy = signal(false); // waiting for the server, the button shows "Bitte warten …"
  name = '';
  description = '';

  /** Step 1: check the name before going on, so a duplicate shows up at once. */
  next(): void {
    const error = this.channelService.validateName(this.name);
    this.nameError.set(error);
    if (!error) this.step.set(2);
  }

  /** Step 2: create the channel, add the chosen people and open it. */
  async create(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    const result = await this.channelService.create(this.name, this.description, this.memberIds());
    this.busy.set(false);
    if (!result.id) return this.backToName(result.error);
    this.state.closeDialog();
    this.state.openView('channel', result.id);
  }

  /**
   * People the channel is created with.
   *
   * @returns Everyone in Devspace or the chosen people
   */
  private memberIds(): string[] {
    return this.addMode() === 'all' ? this.userService.users().map((user) => user.id) : this.selectedIds();
  }

  /**
   * The server refused (name taken, no connection): show the error in step 1 again.
   * * @param error - Text shown below the name field
   *
   * @param error - Text shown below the name field
   */
  private backToName(error: string): void {
    this.nameError.set(error);
    this.step.set(1);
  }
}
