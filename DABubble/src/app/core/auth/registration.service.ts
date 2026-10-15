import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '../data/user.service';

export interface RegistrationDraft {
  name: string;
  email: string;
  password: string;
}

// Keeps the data of step 1 (form) until step 2 (avatar) is done.
// Memory only: the password is never written to localStorage.
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly userService = inject(UserService);
  private readonly draftState = signal<RegistrationDraft | null>(null);
  readonly draft = this.draftState.asReadonly();

  saveDraft(draft: RegistrationDraft): void {
    this.draftState.set(draft);
  }

  // Demo: creates the user locally. With Firebase this creates the real account.
  complete(avatar: string): boolean {
    const draft = this.draftState();
    if (!draft) return false;
    this.userService.addUser(draft.name, draft.email, avatar);
    this.draftState.set(null);
    return true;
  }
}
