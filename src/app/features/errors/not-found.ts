import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Compass, LucideAngularModule } from 'lucide-angular';

/** 404 — page plein écran (hors coquille). */
@Component({
  selector: 'app-not-found',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-dvh items-center justify-center px-4 animate-fade-up">
      <div class="glass-card flex w-full max-w-xl flex-col items-center gap-5 px-8 py-14 text-center">
        <span
          class="inline-flex size-16 items-center justify-center rounded-3xl bg-brand-500/12 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300"
        >
          <lucide-icon [img]="CompassIcon" [size]="30" />
        </span>
        <div>
          <p class="font-display text-5xl font-extrabold text-ink dark:text-cream">404</p>
          <h1 class="mt-2 font-display text-xl font-bold text-ink dark:text-cream">Page introuvable</h1>
          <p class="mt-2 text-sm leading-relaxed text-ink-muted dark:text-cream-bezel2">
            Cette page n'existe pas ou a été déplacée.
          </p>
        </div>
        <a routerLink="/" class="btn-brand">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16" />
          Retour au tableau de bord
        </a>
      </div>
    </section>
  `,
})
export class NotFound {
  protected readonly CompassIcon = Compass;
  protected readonly ArrowLeftIcon = ArrowLeft;
}
