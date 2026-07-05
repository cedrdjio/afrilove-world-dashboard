import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  LucideAngularModule,
  ShieldAlert,
  Sparkles,
  UserPlus,
  type LucideIconData,
} from 'lucide-angular';
import { DashboardStatsService } from '../../core/services/dashboard-stats.service';

interface AdminAlert {
  icon: LucideIconData;
  label: string;
  detail: string;
  link: string;
  urgent: boolean;
}

/** Cloche + panneau des éléments à traiter, dérivés des stats temps réel. */
@Component({
  selector: 'app-notification-panel',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  template: `
    <div class="relative">
      <button
        type="button"
        class="btn-icon relative"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-label="Notifications"
      >
        <lucide-icon [img]="BellIcon" [size]="19" />
        @if (pendingCount() > 0) {
          <span
            class="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white"
          >
            {{ pendingCount() }}
          </span>
        }
      </button>

      @if (open()) {
        <div
          class="glass-card absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden animate-scale-in"
          role="menu"
        >
          <p class="border-b border-ink/6 px-4 py-3 font-display text-sm font-bold text-ink dark:border-white/8 dark:text-cream">
            À traiter
          </p>
          @if (alerts().length === 0) {
            <div class="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <lucide-icon [img]="SparklesIcon" [size]="22" class="text-lilac" />
              <p class="text-sm text-ink-muted dark:text-cream-bezel2">
                Tout est à jour. Rien à traiter pour le moment.
              </p>
            </div>
          } @else {
            <ul>
              @for (alert of alerts(); track alert.link) {
                <li>
                  <a
                    [routerLink]="alert.link"
                    (click)="open.set(false)"
                    class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-100/60 dark:hover:bg-white/6"
                  >
                    <span
                      class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                      [class]="
                        alert.urgent
                          ? 'bg-danger/12 text-danger'
                          : 'bg-brand-500/12 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300'
                      "
                    >
                      <lucide-icon [img]="alert.icon" [size]="17" />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-semibold text-ink dark:text-cream">
                        {{ alert.label }}
                      </span>
                      <span class="block text-xs text-ink-muted dark:text-cream-bezel2">
                        {{ alert.detail }}
                      </span>
                    </span>
                    <lucide-icon [img]="ChevronRightIcon" [size]="15" class="shrink-0 text-ink-faint" />
                  </a>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationPanel {
  private readonly statsService = inject(DashboardStatsService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly BellIcon = Bell;
  protected readonly SparklesIcon = Sparkles;
  protected readonly ChevronRightIcon = ChevronRight;

  readonly open = signal(false);

  protected readonly alerts = computed<AdminAlert[]>(() => {
    const stats = this.statsService.statsQuery.data();
    if (!stats) {
      return [];
    }
    const list: AdminAlert[] = [];
    if (stats.kyc_pending > 0) {
      list.push({
        icon: BadgeCheck,
        label: `${stats.kyc_pending} vérification(s) KYC`,
        detail: 'Des documents attendent une revue manuelle',
        link: '/kyc',
        urgent: false,
      });
    }
    if (stats.reports_pending > 0) {
      list.push({
        icon: ShieldAlert,
        label: `${stats.reports_pending} signalement(s)`,
        detail: 'Des profils ont été signalés par la communauté',
        link: '/moderation',
        urgent: true,
      });
    }
    if (stats.new_users_today > 0) {
      list.push({
        icon: UserPlus,
        label: `${stats.new_users_today} inscription(s) aujourd'hui`,
        detail: 'Nouveaux membres à découvrir',
        link: '/users',
        urgent: false,
      });
    }
    return list;
  });

  protected readonly pendingCount = computed(() => {
    const stats = this.statsService.statsQuery.data();
    return stats ? stats.kyc_pending + stats.reports_pending : 0;
  });

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
