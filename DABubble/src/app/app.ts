import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root component: only contains the router outlet, where the current page is displayed. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
