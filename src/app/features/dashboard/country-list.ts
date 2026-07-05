import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import type { CountryStat } from '../../models/dashboard.model';

interface CountryRow {
  label: string;
  count: number;
  percent: number;
  width: number;
  unknown: boolean;
}

/** Top pays — barres horizontales HTML (pas de lib), teinte marque. */
@Component({
  selector: 'app-country-list',
  imports: [CompactNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="glass-card flex h-full flex-col p-5">
      <h2 class="font-display text-sm font-bold text-ink dark:text-cream">Top pays</h2>
      <p class="mb-4 text-xs text-ink-muted dark:text-cream-bezel2">Membres par pays</p>
      @if (rows().length === 0) {
        <p class="my-auto text-center text-sm text-ink-muted dark:text-cream-bezel2">
          Pas encore de données.
        </p>
      } @else {
        <ul class="flex flex-col gap-3">
          @for (row of rows(); track row.label) {
            <li>
              <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span
                  class="truncate font-semibold"
                  [class]="row.unknown ? 'text-ink-faint dark:text-cream-bezel2/60' : 'text-ink dark:text-cream'"
                >
                  {{ row.label }}
                </span>
                <span class="shrink-0 text-xs text-ink-muted tabular-nums dark:text-cream-bezel2">
                  {{ row.count | compactNumber }} · {{ row.percent }} %
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-brand-500/10 dark:bg-white/8">
                <div
                  class="h-full rounded-full transition-[width] duration-500"
                  [class]="row.unknown ? 'bg-ink-faint/50 dark:bg-cream-bezel2/30' : 'bg-linear-90 from-brand-400 to-brand-600'"
                  [style.width.%]="row.width"
                ></div>
              </div>
            </li>
          }
        </ul>
      }
    </article>
  `,
})
export class CountryList {
  readonly countries = input.required<CountryStat[]>();

  protected readonly rows = computed<CountryRow[]>(() => {
    const stats = this.countries();
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const max = Math.max(...stats.map((stat) => stat.count), 1);
    return stats
      .map((stat) => ({
        label: stat.country ?? 'Non renseigné',
        count: stat.count,
        percent: total > 0 ? Math.round((stat.count / total) * 100) : 0,
        width: Math.round((stat.count / max) * 100),
        unknown: stat.country === null,
      }))
      // Pays connus d'abord, « Non renseigné » en dernier.
      .sort((a, b) => Number(a.unknown) - Number(b.unknown) || b.count - a.count);
  });
}
