import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  BadgeCheck,
  Crown,
  Flag,
  Heart,
  LucideAngularModule,
  UserPlus,
  type LucideIconData,
} from 'lucide-angular';
import type { ActivityItem } from '../../models/dashboard.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

interface KindMeta {
  icon: LucideIconData;
  classes: string;
  caption: string;
}

const KIND_META: Record<string, KindMeta> = {
  signup: {
    icon: UserPlus,
    classes: 'bg-success/12 text-success dark:bg-success/20',
    caption: 'Nouvelle inscription',
  },
  match: {
    icon: Heart,
    classes: 'bg-brand-500/12 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300',
    caption: 'Nouveau match',
  },
  kyc: {
    icon: BadgeCheck,
    classes: 'bg-warning/12 text-warning dark:bg-warning/20',
    caption: 'Demande KYC',
  },
  report: {
    icon: Flag,
    classes: 'bg-danger/12 text-danger dark:bg-danger/20',
    caption: 'Signalement',
  },
  subscription: {
    icon: Crown,
    classes: 'bg-lilac/15 text-lilac-dark dark:bg-lilac/20 dark:text-lilac-light',
    caption: 'Abonnement',
  },
};

/** Flux des derniers événements de la plateforme (RPC admin_recent_activity). */
@Component({
  selector: 'app-activity-feed',
  imports: [LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="glass-card flex h-full flex-col p-5">
      <h2 class="font-display text-sm font-bold text-ink dark:text-cream">Activité récente</h2>
      <p class="mb-3 text-xs text-ink-muted dark:text-cream-bezel2">
        Inscriptions, matchs, KYC, signalements et abonnements
      </p>
      @if (items().length === 0) {
        <p class="my-auto text-center text-sm text-ink-muted dark:text-cream-bezel2">
          Aucune activité pour le moment.
        </p>
      } @else {
        <ul class="flex flex-col">
          @for (item of items(); track item.kind + item.happened_at; let last = $last) {
            <li class="relative flex gap-3 pb-4" [class.pb-0]="last">
              <!-- Ligne de temps verticale -->
              @if (!last) {
                <span
                  class="absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-px bg-ink/8 dark:bg-white/8"
                  aria-hidden="true"
                ></span>
              }
              <span
                class="z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                [class]="meta(item).classes"
              >
                <lucide-icon [img]="meta(item).icon" [size]="16" />
              </span>
              <div class="min-w-0 flex-1 pt-0.5">
                <p class="text-sm text-ink dark:text-cream">
                  <span class="font-semibold">{{ item.label }}</span>
                  <span class="text-ink-muted dark:text-cream-bezel2"> — {{ meta(item).caption }}</span>
                </p>
                @if (item.detail) {
                  <p class="truncate text-xs text-ink-muted dark:text-cream-bezel2">{{ item.detail }}</p>
                }
              </div>
              <span class="shrink-0 pt-1 text-[11px] text-ink-faint dark:text-cream-bezel2/60">
                {{ item.happened_at | relativeTime }}
              </span>
            </li>
          }
        </ul>
      }
    </article>
  `,
})
export class ActivityFeed {
  readonly items = input.required<ActivityItem[]>();

  protected meta(item: ActivityItem): KindMeta {
    return KIND_META[item.kind] ?? KIND_META['signup'];
  }
}
