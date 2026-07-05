import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogOut, LucideAngularModule, PanelLeftClose, PanelLeftOpen, X } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStatsService } from '../../core/services/dashboard-stats.service';
import { hasRoleLevel } from '../../models/admin.model';
import type { NavItem } from '../../models/nav.model';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { Logo } from '../../shared/ui/logo/logo';
import { NAV_SECTIONS } from '../nav-data';

const COLLAPSE_KEY = 'alw-admin-sidebar';

/**
 * Sidebar de verre : repliable en rail d'icônes sur desktop, tiroir
 * plein écran sur mobile. Les entrées sont filtrées par rôle et les
 * badges (KYC, modération) suivent les stats temps réel.
 */
@Component({
  selector: 'app-sidebar',
  imports: [
    CompactNumberPipe,
    Logo,
    LucideAngularModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly statsService = inject(DashboardStatsService);

  /** Rail d'icônes (desktop). Persisté localement. */
  readonly collapsed = model(this.readCollapsed());
  /** Tiroir ouvert (mobile). */
  readonly mobileOpen = model(false);

  protected readonly PanelLeftCloseIcon = PanelLeftClose;
  protected readonly PanelLeftOpenIcon = PanelLeftOpen;
  protected readonly LogOutIcon = LogOut;
  protected readonly XIcon = X;

  protected readonly displayName = this.auth.displayName;
  protected readonly roleLabel = this.auth.roleLabel;
  protected readonly initials = this.auth.initials;

  /** Sections filtrées selon le rôle de l'admin connecté. */
  protected readonly sections = computed(() => {
    const role = this.auth.role();
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.minRole || hasRoleLevel(role, item.minRole)),
    })).filter((section) => section.items.length > 0);
  });

  protected badgeFor(item: NavItem): number {
    const stats = this.statsService.statsQuery.data();
    return stats && item.badge ? item.badge(stats) : 0;
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
    try {
      localStorage.setItem(COLLAPSE_KEY, String(this.collapsed()));
    } catch {
      // Persistance facultative.
    }
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
