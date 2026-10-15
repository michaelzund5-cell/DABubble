import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Root component: only contains the router outlet, where the current page is displayed.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

/*
 * =====================================================================
 * ZUSAMMENFASSUNG (Deutsch)
 * =====================================================================
 * Die Hauptkomponente (Root Component) der App.
 *
 * - @Component: Decorator, der die Klasse zu einer Angular-Component
 *   macht. selector ist der HTML-Tag (<app-root>), templateUrl das
 *   HTML und styleUrl das SCSS.
 * - imports: [RouterOutlet]: Standalone Component. Sie gibt selbst an,
 *   welche Bausteine sie braucht.
 * - Die Klasse ist leer, weil die Hauptkomponente nur den Platz für
 *   die Seiten bereitstellt.
 */
