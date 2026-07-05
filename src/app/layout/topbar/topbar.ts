import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogOut, LucideAngularModule, Menu, Moon, Search, Sun } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { GlobalSearchService } from '../../core/services/global-search.service';
import { ThemeService } from '../../core/services/theme.service';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { NotificationPanel } from '../notifications/notification-panel';

/** Barre supérieure : burger mobile, fil d'Ariane, recherche ⌘K, thème, alertes, compte. */
@Component({
  selector: 'app-topbar',
  imports: [Breadcrumbs, LucideAngularModule, MatMenuModule, MatTooltipModule, NotificationPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly search = inject(GlobalSearchService);

  readonly menuClick = output<void>();

  protected readonly MenuIcon = Menu;
  protected readonly SearchIcon = Search;
  protected readonly SunIcon = Sun;
  protected readonly MoonIcon = Moon;
  protected readonly LogOutIcon = LogOut;

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
