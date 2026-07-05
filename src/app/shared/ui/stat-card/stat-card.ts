import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

export type StatAccent = 'brand' | 'lilac' | 'success' | 'warning';
export type StatFormat = 'number' | 'currency';

const COUNT_UP_MS = 650;

const numberFormatter = new Intl.NumberFormat('fr-FR');
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

/** Tuile KPI du bento : icône teintée, valeur animée (count-up), delta optionnel. */
@Component({
  selector: 'app-stat-card',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="glass-card glass-card-hover flex h-full flex-col gap-4 p-5">
      <div class="flex items-center justify-between">
        <span
          class="inline-flex size-11 items-center justify-center rounded-2xl"
          [class]="accentClasses()"
        >
          <lucide-icon [img]="icon()" [size]="22" />
        </span>
        @if (live()) {
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
            <span class="live-dot"></span>
            En direct
          </span>
        }
      </div>
      <div>
        <p class="font-display text-3xl font-bold tracking-tight text-ink tabular-nums dark:text-cream">
          {{ displayText() }}
        </p>
        <p class="mt-1 text-sm text-ink-muted dark:text-cream-bezel2">{{ label() }}</p>
      </div>
      @if (delta()) {
        <p class="mt-auto text-xs font-semibold text-success">{{ delta() }}</p>
      }
    </article>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<LucideIconData>();
  readonly accent = input<StatAccent>('brand');
  readonly format = input<StatFormat>('number');
  readonly delta = input<string>('');
  readonly live = input(false);

  private readonly animated = signal(0);

  protected readonly displayText = computed(() => {
    const amount = this.animated();
    return this.format() === 'currency'
      ? currencyFormatter.format(amount / 100)
      : numberFormatter.format(amount);
  });

  protected readonly accentClasses = computed(() => {
    switch (this.accent()) {
      case 'lilac':
        return 'bg-lilac/15 text-lilac-dark dark:bg-lilac/20 dark:text-lilac-light';
      case 'success':
        return 'bg-success/12 text-success dark:bg-success/20';
      case 'warning':
        return 'bg-warning/12 text-warning dark:bg-warning/20';
      default:
        return 'bg-brand-500/12 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300';
    }
  });

  constructor() {
    // Count-up : anime la valeur affichée vers la cible à chaque mise à jour.
    effect((onCleanup) => {
      const target = this.value();
      const from = this.animated();
      if (from === target) {
        return;
      }
      const start = performance.now();
      let frame = 0;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / COUNT_UP_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.animated.set(Math.round(from + (target - from) * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(frame));
    });
  }
}
