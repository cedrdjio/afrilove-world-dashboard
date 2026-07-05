import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/** Avatar avec repli sur les initiales (dégradé marque) si pas de photo. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img
        [src]="src()"
        [alt]="name() || 'Avatar'"
        class="size-full rounded-2xl object-cover"
        loading="lazy"
        (error)="failed.set(true)"
      />
    } @else {
      <span
        class="flex size-full items-center justify-center rounded-2xl bg-linear-135 from-brand-400 to-brand-600 font-display font-bold text-white"
        [style.font-size.px]="size() * 0.34"
      >
        {{ initials() }}
      </span>
    }
  `,
  host: {
    class: 'inline-block shrink-0 overflow-hidden rounded-2xl',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class Avatar {
  readonly src = input<string | null>(null);
  readonly name = input<string | null>('');
  readonly size = input(40);

  protected readonly failed = signal(false);

  protected readonly initials = computed(
    () =>
      (this.name() || '?')
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join('') || '?',
  );
}
