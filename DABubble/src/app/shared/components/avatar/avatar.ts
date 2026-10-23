import { Component, input } from '@angular/core';
import { DEFAULT_AVATAR } from '../../models/avatars';
import { User } from '../../models/user.model';

/** Round user picture, optionally with the online dot (Figma: green / grey). */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  readonly user = input.required<User>();
  readonly size = input(50);
  readonly showStatus = input(false);
  readonly defaultAvatar = DEFAULT_AVATAR;
}
