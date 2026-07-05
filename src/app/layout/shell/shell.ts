import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalSearch } from '../search/global-search';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/** Coquille du back-office : sidebar + topbar + contenu, responsive. */
@Component({
  selector: 'app-shell',
  imports: [GlobalSearch, RouterOutlet, Sidebar, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh">
      <app-sidebar [(mobileOpen)]="mobileNavOpen" />
      <div class="flex min-w-0 flex-1 flex-col">
        <app-topbar (menuClick)="mobileNavOpen.set(true)" />
        <main class="flex-1 px-4 py-6 md:px-8 lg:pl-5">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-global-search />
  `,
})
export class Shell {
  protected readonly mobileNavOpen = signal(false);
}
